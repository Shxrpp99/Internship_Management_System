package com.ims.repository;

import com.ims.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByCompanyId(Long companyId);
    boolean existsByCompanyId(Long companyId);
}
