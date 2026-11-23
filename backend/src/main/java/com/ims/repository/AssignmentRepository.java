package com.ims.repository;

import com.ims.entity.InternshipAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<InternshipAssignment, Long> {
    List<InternshipAssignment> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
    List<InternshipAssignment> findBySupervisorId(Long supervisorId);
    List<InternshipAssignment> findByInternshipCompanyId(Long companyId);
    boolean existsByStudentIdAndInternshipId(Long studentId, Long internshipId);
    boolean existsByInternshipId(Long internshipId);
    boolean existsBySupervisorIdAndStudentId(Long supervisorId, Long studentId);
}
