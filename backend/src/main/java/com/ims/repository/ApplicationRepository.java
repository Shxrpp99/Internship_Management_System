package com.ims.repository;

import com.ims.entity.Application;
import com.ims.entity.Enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByInternshipId(Long internshipId);
    boolean existsByStudentIdAndInternshipId(Long studentId, Long internshipId);
    boolean existsByStudentId(Long studentId);
    List<Application> findByStudentId(Long studentId);
    List<Application> findByInternshipCompanyId(Long companyId);
    List<Application> findByInternshipId(Long internshipId);
    long countByInternshipIdAndStatus(Long internshipId, ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
    Optional<Application> findByDocumentPath(String documentPath);
    Optional<Application> findByStudentIdAndInternshipId(Long studentId, Long internshipId);
}
