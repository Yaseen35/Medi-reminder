package com.medicine.reminder.controller;

import com.medicine.reminder.model.MentorConnection;
import com.medicine.reminder.service.MentorService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentors")
public class MentorController {
    private final MentorService mentorService;

    public MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    private Long uid(Authentication a) {
        return (Long) a.getDetails();
    }

    @GetMapping
    public Map<String, Object> getOverview(Authentication a) {
        return mentorService.getConnectionsOverview(uid(a));
    }

    @GetMapping("/code")
    public Map<String, String> getCode(Authentication a) {
        return Map.of("inviteCode", mentorService.getOrGenerateInviteCode(uid(a)));
    }

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public MentorConnection invite(@RequestBody Map<String, String> body, Authentication a) {
        String identifier = body.get("identifier");
        String role = body.getOrDefault("role", "MENTOR");
        return mentorService.invite(uid(a), identifier, role);
    }

    @PostMapping("/connections/{id}/respond")
    public MentorConnection respond(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication a) {
        Object acceptObj = body.get("accept");
        if (acceptObj == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "accept flag is required");
        }
        boolean accept = Boolean.parseBoolean(acceptObj.toString());
        return mentorService.respondInvitation(id, uid(a), accept);
    }

    @DeleteMapping("/connections/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConnection(@PathVariable Long id, Authentication a) {
        mentorService.deleteConnection(id, uid(a));
    }

    @GetMapping("/mentees/{menteeId}/overview")
    public Map<String, Object> getMenteeOverview(@PathVariable Long menteeId, Authentication a) {
        return mentorService.getMenteeOverview(uid(a), menteeId);
    }

    @GetMapping("/connections/{id}/notes")
    public List<Map<String, Object>> getNotes(@PathVariable Long id, Authentication a) {
        return mentorService.getNotes(id, uid(a));
    }

    @PostMapping("/connections/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> sendNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication a) {
        String msg = body.get("message");
        return mentorService.sendNote(id, uid(a), msg);
    }
}
