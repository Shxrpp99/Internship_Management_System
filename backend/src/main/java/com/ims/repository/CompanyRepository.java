package com.ims.repository;

import com.ims.entity.Company;
import com.ims.entity.Enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(Long userId);
    long countByApprovalStatus(ApprovalStatus status);
}
