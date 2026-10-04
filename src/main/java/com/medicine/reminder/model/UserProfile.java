package com.medicine.reminder.model;
import jakarta.persistence.*; import lombok.*; import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="user_profiles") @Getter @Setter @NoArgsConstructor
public class UserProfile {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="user_id") @JsonIgnore private User user;
 @Column(nullable=false) private String name;
 @Column(nullable=false) private String relation;
 private String avatar;
 @Column(nullable=true) private Integer age;
 @Column(nullable=true) private String allergies;
}
