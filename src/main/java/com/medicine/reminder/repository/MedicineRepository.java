package com.medicine.reminder.repository;
import com.medicine.reminder.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface MedicineRepository extends JpaRepository<Medicine,Long>{ List<Medicine> findByProfileId(Long profileId); Optional<Medicine> findByIdAndProfileUserId(Long id,Long userId); }
