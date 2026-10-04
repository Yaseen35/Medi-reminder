package com.medicine.reminder.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name="mentor_notes")
@Getter
@Setter
@NoArgsConstructor
public class MentorNote {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="connection_id")
    @JsonIgnore
    private MentorConnection connection;

    @ManyToOne(optional=false)
    @JoinColumn(name="sender_id")
    private User sender;

    @Column(nullable=false, length=1000)
    private String message;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void created() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
