package com.medicine.reminder.repository;
import com.medicine.reminder.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface UserRepository extends JpaRepository<User,Long>{ Optional<User> findByUsername(String username); boolean existsByUsername(String username); boolean existsByEmail(String email); }
