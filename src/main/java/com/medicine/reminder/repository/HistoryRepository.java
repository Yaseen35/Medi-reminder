package com.medicine.reminder.repository;
import com.medicine.reminder.model.*; import org.springframework.data.jpa.repository.*; import java.time.*; import java.util.*;
public interface HistoryRepository extends JpaRepository<MedicineHistory,Long>{
 @Query("select h from MedicineHistory h where h.reminder.id=:reminderId and h.takenAt >= :start and h.takenAt < :end") List<MedicineHistory> findToday(Long reminderId,LocalDateTime start,LocalDateTime end);
 List<MedicineHistory> findByReminderMedicineProfileIdOrderByTakenAtDesc(Long profileId);
}
