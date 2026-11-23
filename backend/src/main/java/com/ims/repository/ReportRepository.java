package com.ims.repository;

import com.ims.entity.ProgressReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<ProgressReport, Long> {
    boolean existsByAssignmentId(Long assignmentId);
    List<ProgressReport> findByAssignmentStudentIdOrderBySubmissionDateDesc(Long studentId);
    List<ProgressReport> findByAssignmentSupervisorIdOrderBySubmissionDateDesc(Long supervisorId);
    List<ProgressReport> findByAssignmentInternshipCompanyIdOrderBySubmissionDateDesc(Long companyId);
    List<ProgressReport> findByAssignmentIdOrderBySubmissionDateDesc(Long assignmentId);
}
