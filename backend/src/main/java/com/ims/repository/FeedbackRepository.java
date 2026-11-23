package com.ims.repository;

import com.ims.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByReportIdOrderByFeedbackDateAsc(Long reportId);
    boolean existsBySupervisorId(Long supervisorId);
}
