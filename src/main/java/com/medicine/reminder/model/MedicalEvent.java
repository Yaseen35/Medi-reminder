package com.medicine.reminder.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="medical_events")
@Getter
@Setter
@NoArgsConstructor
public class MedicalEvent {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="profile_id")
    @JsonIgnore
    private UserProfile profile;

    @Column(nullable=false)
    private String title;

    @Column(nullable=false)
    private LocalDate eventDate;

    private String eventTime;

    @Column(nullable=false)
    private String eventType = "APPOINTMENT"; // APPOINTMENT, CHECKUP, LAB_TEST, REFILL, OTHER

    private String location;

    private String notes;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void created() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
