package com.medicine.reminder.controller;

import com.medicine.reminder.model.MedicalEvent;
import com.medicine.reminder.model.UserProfile;
import com.medicine.reminder.repository.MedicalEventRepository;
import com.medicine.reminder.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class MedicalEventController {
    private final MedicalEventRepository events;
    private final ProfileRepository profiles;

    public MedicalEventController(MedicalEventRepository events, ProfileRepository profiles) {
        this.events = events;
        this.profiles = profiles;
    }

    private Long uid(Authentication a) {
        return (Long) a.getDetails();
    }

    @GetMapping
    public List<MedicalEvent> list(@RequestParam Long profileId, Authentication a) {
        profiles.findByIdAndUserId(profileId, uid(a))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return events.findByProfileIdOrderByEventDateAsc(profileId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalEvent create(@RequestBody Map<String, String> body, Authentication a) {
        String profileIdStr = body.get("profileId");
        if (profileIdStr == null || profileIdStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile ID is required");
        }
        Long profileId = Long.parseLong(profileIdStr);
        UserProfile p = profiles.findByIdAndUserId(profileId, uid(a))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        String title = body.getOrDefault("title", "").trim();
        if (title.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        String dateStr = body.get("eventDate");
        if (dateStr == null || dateStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event date is required");
        }

        MedicalEvent event = new MedicalEvent();
        event.setProfile(p);
        event.setTitle(title);
        event.setEventDate(LocalDate.parse(dateStr.trim()));
        event.setEventTime(body.get("eventTime"));
        event.setEventType(body.getOrDefault("eventType", "APPOINTMENT"));
        event.setLocation(body.get("location"));
        event.setNotes(body.get("notes"));
        return events.save(event);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication a) {
        MedicalEvent event = events.findByIdAndProfileUserId(id, uid(a))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        events.delete(event);
    }
}
