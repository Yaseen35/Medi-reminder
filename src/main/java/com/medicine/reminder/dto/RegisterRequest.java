package com.medicine.reminder.dto; import jakarta.validation.constraints.*; import lombok.*;
@Getter @Setter public class RegisterRequest { @NotBlank private String username; @Email @NotBlank private String email; @Size(min=8) private String password; }
