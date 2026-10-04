package com.medicine.reminder.repository;

import com.medicine.reminder.model.MentorConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MentorConnectionRepository extends JpaRepository<MentorConnection, Long> {
    List<MentorConnection> findByMentorIdOrderByCreatedAtDesc(Long mentorId);
    List<MentorConnection> findByMenteeIdOrderByCreatedAtDesc(Long menteeId);

    @Query("SELECT c FROM MentorConnection c WHERE (c.mentor.id = :u1 AND c.mentee.id = :u2) OR (c.mentor.id = :u2 AND c.mentee.id = :u1)")
    List<MentorConnection> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);

    @Query("SELECT c FROM MentorConnection c WHERE c.id = :id AND (c.mentor.id = :userId OR c.mentee.id = :userId)")
    Optional<MentorConnection> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    Optional<MentorConnection> findByMentorIdAndMenteeIdAndStatus(Long mentorId, Long menteeId, String status);
}
