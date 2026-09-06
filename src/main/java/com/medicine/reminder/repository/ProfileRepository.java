package com.medicine.reminder.repository;
import com.medicine.reminder.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ProfileRepository extends JpaRepository<UserProfile,Long>{ List<UserProfile> findByUserId(Long userId); Optional<UserProfile> findByIdAndUserId(Long id, Long userId); }
