package com.medicine.reminder.service;

import com.medicine.reminder.model.*;
import com.medicine.reminder.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@Service
public class MentorService {
    private final MentorConnectionRepository connections;
    private final MentorNoteRepository notes;
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final MedicineRepository medicines;
    private final ReminderRepository reminders;
    private final HistoryService historyService;

    public MentorService(
            MentorConnectionRepository connections,
            MentorNoteRepository notes,
            UserRepository users,
            ProfileRepository profiles,
            MedicineRepository medicines,
            ReminderRepository reminders,
            HistoryService historyService) {
        this.connections = connections;
        this.notes = notes;
        this.users = users;
        this.profiles = profiles;
        this.medicines = medicines;
        this.reminders = reminders;
        this.historyService = historyService;
    }

    public String getOrGenerateInviteCode(Long userId) {
        User u = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (u.getInviteCode() == null || u.getInviteCode().isBlank()) {
            u.setInviteCode("MTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            users.save(u);
        }
        return u.getInviteCode();
    }

    public MentorConnection invite(Long currentUserId, String identifier, String role) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mentor email or invite code is required");
        }
        String cleanId = identifier.trim();
        User target = users.findByInviteCodeIgnoreCase(cleanId)
                .or(() -> users.findByEmailIgnoreCase(cleanId))
                .or(() -> users.findByUsernameIgnoreCase(cleanId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with: " + cleanId));

        if (target.getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot link with yourself as mentor/caregiver");
        }

        User currentUser = users.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean currentIsMentee = "MENTOR".equalsIgnoreCase(role);
        User mentor = currentIsMentee ? target : currentUser;
        User mentee = currentIsMentee ? currentUser : target;
        String initiatedBy = currentIsMentee ? "MENTEE" : "MENTOR";

        List<MentorConnection> existing = connections.findBetweenUsers(currentUserId, target.getId());
        for (MentorConnection c : existing) {
            if ("ACCEPTED".equals(c.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already connected with " + target.getUsername());
            }
            if ("PENDING".equals(c.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An invitation is already pending with " + target.getUsername());
            }
            if ("REJECTED".equals(c.getStatus())) {
                connections.delete(c);
            }
        }

        MentorConnection conn = new MentorConnection();
        conn.setMentor(mentor);
        conn.setMentee(mentee);
        conn.setStatus("PENDING");
        conn.setInitiatedBy(initiatedBy);
        return connections.save(conn);
    }

    public MentorConnection respondInvitation(Long connectionId, Long currentUserId, boolean accept) {
        MentorConnection c = connections.findByIdAndUserId(connectionId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        Long recipientId = "MENTOR".equals(c.getInitiatedBy()) ? c.getMentee().getId() : c.getMentor().getId();
        if (!recipientId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot accept or reject an invitation you initiated");
        }
        if (!"PENDING".equals(c.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is already " + c.getStatus().toLowerCase());
        }

        c.setStatus(accept ? "ACCEPTED" : "REJECTED");
        return connections.save(c);
    }

    public void deleteConnection(Long connectionId, Long currentUserId) {
        MentorConnection c = connections.findByIdAndUserId(connectionId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));
        List<MentorNote> nList = notes.findByConnectionIdOrderByCreatedAtAsc(connectionId);
        notes.deleteAll(nList);
        connections.delete(c);
    }

    public Map<String, Object> getConnectionsOverview(Long currentUserId) {
        String inviteCode = getOrGenerateInviteCode(currentUserId);
        List<MentorConnection> mentorsAsMentee = connections.findByMenteeIdOrderByCreatedAtDesc(currentUserId);
        List<MentorConnection> menteesAsMentor = connections.findByMentorIdOrderByCreatedAtDesc(currentUserId);

        List<Map<String, Object>> mentorsList = mentorsAsMentee.stream().map(c -> formatConn(c, c.getMentor(), currentUserId)).toList();
        List<Map<String, Object>> menteesList = menteesAsMentor.stream().map(c -> formatConn(c, c.getMentee(), currentUserId)).toList();

        return Map.of(
                "inviteCode", inviteCode,
                "myMentors", mentorsList,
                "myMentees", menteesList
        );
    }

    private Map<String, Object> formatConn(MentorConnection c, User other, Long currentUserId) {
        boolean initiatedByMe = ("MENTEE".equals(c.getInitiatedBy()) && c.getMentee().getId().equals(currentUserId))
                || ("MENTOR".equals(c.getInitiatedBy()) && c.getMentor().getId().equals(currentUserId));
        boolean canRespond = "PENDING".equals(c.getStatus()) && !initiatedByMe;

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", c.getId());
        res.put("status", c.getStatus());
        res.put("initiatedBy", c.getInitiatedBy());
        res.put("initiatedByMe", initiatedByMe);
        res.put("canRespond", canRespond);
        res.put("createdAt", c.getCreatedAt().toString());
        res.put("notesCount", notes.findByConnectionIdOrderByCreatedAtAsc(c.getId()).size());
        res.put("otherUser", Map.of(
                "id", other.getId(),
                "username", other.getUsername(),
                "email", other.getEmail(),
                "inviteCode", other.getInviteCode() != null ? other.getInviteCode() : ""
        ));
        return res;
    }

    public Map<String, Object> getMenteeOverview(Long mentorId, Long menteeId) {
        connections.findByMentorIdAndMenteeIdAndStatus(mentorId, menteeId, "ACCEPTED")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view this mentee's adherence."));

        User menteeUser = users.findById(menteeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mentee not found"));

        List<UserProfile> menteeProfiles = profiles.findByUserId(menteeId);

        List<Map<String, Object>> medicinesList = new ArrayList<>();
        List<Reminder> allReminders = new ArrayList<>();

        for (UserProfile p : menteeProfiles) {
            List<Medicine> meds = medicines.findByProfileId(p.getId());
            for (Medicine m : meds) {
                medicinesList.add(Map.of(
                        "id", m.getId(),
                        "name", m.getName(),
                        "dosage", m.getDosage(),
                        "description", Optional.ofNullable(m.getDescription()).orElse(""),
                        "color", m.getColor(),
                        "stock", Optional.ofNullable(m.getStock()).orElse(0),
                        "lowStockThreshold", Optional.ofNullable(m.getLowStockThreshold()).orElse(5),
                        "profileName", p.getName(),
                        "profileRelation", p.getRelation()
                ));
                allReminders.addAll(reminders.findByMedicineIdOrderByTimeAsc(m.getId()));
            }
        }

        LocalDate today = LocalDate.now();
        String day = today.getDayOfWeek().name().substring(0, 3);
        int takenToday = 0;
        int missedToday = 0;
        int pendingToday = 0;

        List<Map<String, Object>> todayDoses = new ArrayList<>();
        for (Reminder r : allReminders) {
            if (!Boolean.TRUE.equals(r.getIsActive())) continue;
            if (r.getStartDate() != null && today.isBefore(r.getStartDate())) continue;
            if (r.getEndDate() != null && today.isAfter(r.getEndDate())) continue;
            if ("WEEKLY".equals(r.getFrequency()) && (r.getDaysOfWeek() == null || !r.getDaysOfWeek().contains(day))) continue;

            MedicineHistory h = historyService.today(r.getId());
            String status = (h == null) ? "PENDING" : h.getStatus();
            if ("TAKEN".equals(status)) takenToday++;
            else if ("MISSED".equals(status) || "SKIPPED".equals(status)) missedToday++;
            else pendingToday++;

            Medicine m = r.getMedicine();
            Map<String, Object> dose = new LinkedHashMap<>();
            dose.put("reminderId", r.getId());
            dose.put("time", r.getTime());
            dose.put("frequency", r.getFrequency());
            dose.put("medicineName", m.getName());
            dose.put("dosage", m.getDosage());
            dose.put("color", m.getColor());
            dose.put("profileName", m.getProfile().getName());
            dose.put("status", status);
            dose.put("takenAt", h != null && h.getTakenAt() != null ? h.getTakenAt().toString() : "");
            todayDoses.add(dose);
        }
        todayDoses.sort(Comparator.comparing(d -> (String) d.get("time")));

        // History logs
        List<Map<String, Object>> historyLogs = new ArrayList<>();
        for (UserProfile p : menteeProfiles) {
            for (MedicineHistory mh : historyService.list(p.getId())) {
                Medicine med = mh.getReminder().getMedicine();
                Map<String, Object> log = new LinkedHashMap<>();
                log.put("id", mh.getId());
                log.put("takenAt", mh.getTakenAt().toString());
                log.put("status", mh.getStatus());
                log.put("medicineName", med.getName());
                log.put("dosage", med.getDosage());
                log.put("profileName", p.getName());
                historyLogs.add(log);
            }
        }
        historyLogs.sort((a, b) -> ((String) b.get("takenAt")).compareTo((String) a.get("takenAt")));
        if (historyLogs.size() > 30) {
            historyLogs = new ArrayList<>(historyLogs.subList(0, 30));
        }

        int totalToday = takenToday + missedToday + pendingToday;
        int adherencePercent = totalToday > 0 ? (int) Math.round((takenToday * 100.0) / totalToday) : 100;
        int streak = calculateMenteeStreak(menteeProfiles);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mentee", Map.of(
                "id", menteeUser.getId(),
                "username", menteeUser.getUsername(),
                "email", menteeUser.getEmail(),
                "joinedAt", menteeUser.getCreatedAt().toString()
        ));
        result.put("adherence", Map.of(
                "totalToday", totalToday,
                "takenToday", takenToday,
                "missedToday", missedToday,
                "pendingToday", pendingToday,
                "adherencePercent", adherencePercent,
                "streakDays", streak
        ));
        result.put("todayDoses", todayDoses);
        result.put("medicines", medicinesList);
        result.put("recentHistory", historyLogs);

        return result;
    }

    private int calculateMenteeStreak(List<UserProfile> profilesList) {
        Map<LocalDate, List<MedicineHistory>> days = new HashMap<>();
        for (UserProfile p : profilesList) {
            for (MedicineHistory h : historyService.list(p.getId())) {
                days.computeIfAbsent(h.getTakenAt().toLocalDate(), k -> new ArrayList<>()).add(h);
            }
        }
        int streak = 0;
        for (LocalDate d = LocalDate.now(); ; d = d.minusDays(1)) {
            List<MedicineHistory> e = days.get(d);
            if (e == null || e.isEmpty() || e.stream().anyMatch(h -> !"TAKEN".equals(h.getStatus()))) {
                break;
            }
            streak++;
        }
        return streak;
    }

    public List<Map<String, Object>> getNotes(Long connectionId, Long currentUserId) {
        connections.findByIdAndUserId(connectionId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        return notes.findByConnectionIdOrderByCreatedAtAsc(connectionId).stream().map(n -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", n.getId());
            map.put("senderId", n.getSender().getId());
            map.put("senderUsername", n.getSender().getUsername());
            map.put("message", n.getMessage());
            map.put("createdAt", n.getCreatedAt().toString());
            map.put("isMe", n.getSender().getId().equals(currentUserId));
            return map;
        }).toList();
    }

    public Map<String, Object> sendNote(Long connectionId, Long currentUserId, String message) {
        MentorConnection c = connections.findByIdAndUserId(connectionId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        if (!"ACCEPTED".equals(c.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send notes on an unaccepted connection");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }
        if (message.trim().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is too long (maximum 1000 characters)");
        }

        User sender = users.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        MentorNote note = new MentorNote();
        note.setConnection(c);
        note.setSender(sender);
        note.setMessage(message.trim());
        MentorNote saved = notes.save(note);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", saved.getId());
        res.put("senderId", sender.getId());
        res.put("senderUsername", sender.getUsername());
        res.put("message", saved.getMessage());
        res.put("createdAt", saved.getCreatedAt().toString());
        res.put("isMe", true);
        return res;
    }
}
