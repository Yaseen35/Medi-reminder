package com.medicine.reminder.dto; import jakarta.validation.constraints.*; import lombok.*;
@Getter @Setter public class MedicineDTO { @NotNull private Long profileId; @NotBlank private String name; @NotBlank private String dosage; private String description; private String color; @Min(0) private Integer stock; @Min(0) private Integer lowStockThreshold; }
