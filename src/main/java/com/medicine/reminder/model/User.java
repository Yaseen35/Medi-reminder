package com.medicine.reminder.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="users") @Getter @Setter @NoArgsConstructor
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true) private String username;
 @Column(nullable=false,unique=true) private String email;
 @Column(nullable=false) private String password;
 @Column(nullable=false) private LocalDateTime createdAt;
 @PrePersist void created(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
}
