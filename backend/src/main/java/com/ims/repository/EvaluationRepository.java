package com.ims.repository;

import com.ims.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    boolean existsByAssignmentId(Long assignmentId);
    List<Evaluation> findByAssignmentId(Long assignmentId);
    List<Evaluation> findByEvaluatorId(Long evaluatorId);
    List<Evaluation> findByAssignmentStudentUserId(Long userId);
    List<Evaluation> findByAssignmentSupervisorId(Long supervisorId);
    List<Evaluation> findByAssignmentInternshipCompanyUserId(Long userId);
    boolean existsByEvaluatorId(Long evaluatorId);
    boolean existsByAssignmentIdAndEvaluatorId(Long assignmentId, Long evaluatorId);
}
