package com.medicine.reminder.dto; import jakarta.validation.constraints.*; import lombok.*;
@Getter @Setter public class LoginRequest { @NotBlank private String username; @NotBlank private String password; }
