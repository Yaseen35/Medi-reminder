package com.medicine.reminder.repository;
import com.medicine.reminder.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ReminderRepository extends JpaRepository<Reminder,Long>{ List<Reminder> findByMedicineIdOrderByTimeAsc(Long medicineId); List<Reminder> findByMedicineProfileId(Long profileId); List<Reminder> findByIsActiveTrue(); Optional<Reminder> findByIdAndMedicineProfileUserId(Long id,Long userId); }
