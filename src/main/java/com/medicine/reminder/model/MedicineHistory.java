package com.medicine.reminder.model;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime; import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="medicine_history") @Getter @Setter @NoArgsConstructor
public class MedicineHistory {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="reminder_id") @JsonIgnore private Reminder reminder;
 @Column(nullable=false) private LocalDateTime takenAt;
 @Column(nullable=false) private String status;
 @PrePersist void created(){ if(takenAt==null) takenAt=LocalDateTime.now(); }
}
