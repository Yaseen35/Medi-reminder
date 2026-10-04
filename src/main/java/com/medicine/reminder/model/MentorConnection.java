package com.medicine.reminder.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name="mentor_connections")
@Getter
@Setter
@NoArgsConstructor
public class MentorConnection {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="mentor_id")
    private User mentor;

    @ManyToOne(optional=false)
    @JoinColumn(name="mentee_id")
    private User mentee;

    @Column(nullable=false)
    private String status; // PENDING, ACCEPTED, REJECTED

    @Column(nullable=false)
    private String initiatedBy; // MENTOR or MENTEE

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void created() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
