package com.medicine.reminder.model;
import jakarta.persistence.*; import lombok.*; import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="medicines") @Getter @Setter @NoArgsConstructor
public class Medicine {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="profile_id") @JsonIgnore private UserProfile profile;
 @Column(nullable=false) private String name;
 @Column(nullable=false) private String dosage;
 private String description;
 @Column(nullable=false) private String color="#4CAF50";
 @Column(nullable=true) private Integer stock=30;
 @Column(nullable=true) private Integer lowStockThreshold=5;
}
