package com.medicine.reminder.repository;

import com.medicine.reminder.model.MentorNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorNoteRepository extends JpaRepository<MentorNote, Long> {
    List<MentorNote> findByConnectionIdOrderByCreatedAtAsc(Long connectionId);
}
