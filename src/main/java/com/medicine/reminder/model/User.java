package com.medicine.reminder.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

@Entity @Table(name="users") @Getter @Setter @NoArgsConstructor
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true) private String username;
 @Column(nullable=false,unique=true) private String email;
 @JsonIgnore @Column(nullable=false) private String password;
 @Column(nullable=false) private LocalDateTime createdAt;
 @Column(unique=true) private String inviteCode;
 @PrePersist void created(){ 
  if(createdAt==null) createdAt=LocalDateTime.now(); 
  if(inviteCode==null||inviteCode.isBlank()) inviteCode="MTR-"+UUID.randomUUID().toString().substring(0,8).toUpperCase();
 }
}
