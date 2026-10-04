package com.medicine.reminder.repository;

import com.medicine.reminder.model.MedicalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalEventRepository extends JpaRepository<MedicalEvent, Long> {
    List<MedicalEvent> findByProfileIdOrderByEventDateAsc(Long profileId);
    Optional<MedicalEvent> findByIdAndProfileUserId(Long id, Long userId);
}
