package com.medicine.reminder.model;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate; import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="reminders") @Getter @Setter @NoArgsConstructor
public class Reminder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="medicine_id") @JsonIgnore private Medicine medicine;
 @Column(nullable=false) private String time;
 @Column(nullable=false) private String frequency;
 private String daysOfWeek;
 private LocalDate startDate;
 private LocalDate endDate;
 @Column(nullable=false) private Boolean isActive=true;
}
