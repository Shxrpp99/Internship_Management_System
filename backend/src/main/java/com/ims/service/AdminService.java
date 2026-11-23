package com.ims.service;

import com.ims.dto.Dtos.UserResponse;
import com.ims.dto.Dtos.ManagedUserCreateRequest;
import com.ims.dto.Dtos.ManagedUserUpdateRequest;
import com.ims.entity.Enums.*;
import com.ims.entity.User;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    private final UserRepository users;
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final InternshipRepository internships;
    private final ApplicationRepository applications;
    private final AssignmentRepository assignments;
    private final ReportRepository reports;
    private final EvaluationRepository evaluations;
    private final FeedbackRepository feedback;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService current;

    @Transactional(readOnly = true)
    public Map<String, Long> stats() {
        Map<String, Long> m = new LinkedHashMap<>();
        m.put("totalUsers", users.count());
        m.put("students", students.count());
        m.put("companies", companies.count());
        m.put("pendingCompanies", companies.countByApprovalStatus(ApprovalStatus.PENDING));
        m.put("internships", internships.count());
        m.put("applications", applications.count());
        m.put("acceptedApplications", applications.countByStatus(ApplicationStatus.ACCEPTED));
        m.put("assignments", assignments.count());
        m.put("reports", reports.count());
        m.put("evaluations", evaluations.count());
        return m;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> users() {
        return users.findAll().stream().map(Mapper::user).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse user(Long id) {
        return Mapper.user(users.findById(id).orElseThrow(() -> ApiException.notFound("User not found")));
    }

    public UserResponse createUser(ManagedUserCreateRequest request) {
        if (request.role() != Role.ADMIN && request.role() != Role.SUPERVISOR)
            throw ApiException.badRequest("Create student and company accounts through their dedicated endpoints");
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw ApiException.conflict("Email is already registered");
        User user = users.save(User.builder().email(email).passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role()).active(true).fullName(request.fullName().trim()).build());
        return Mapper.user(user);
    }

    public UserResponse updateUser(Long id, ManagedUserUpdateRequest request) {
        User target = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(current.get().getId()) && !request.active())
            throw ApiException.badRequest("You cannot deactivate your own account");
        target.setActive(request.active());
        if (request.fullName() != null && !request.fullName().isBlank())
            target.setFullName(request.fullName().trim());
        return Mapper.user(users.save(target));
    }

    public void deleteUser(Long id) {
        User target = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(current.get().getId()))
            throw ApiException.badRequest("You cannot delete your own account");
        if (target.getRole() == Role.STUDENT || target.getRole() == Role.COMPANY)
            throw ApiException.conflict("Delete student or company accounts through their dedicated endpoints");
        if (target.getRole() == Role.SUPERVISOR
                && (!assignments.findBySupervisorId(target.getId()).isEmpty()
                    || feedback.existsBySupervisorId(target.getId())
                    || evaluations.existsByEvaluatorId(target.getId())))
            throw ApiException.conflict("Supervisors with assignments, feedback, or evaluations cannot be deleted");
        users.delete(target);
    }

    public UserResponse setActive(Long id, boolean active) {
        User target = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(current.get().getId()) && !active)
            throw ApiException.badRequest("You cannot deactivate your own account");
        target.setActive(active);
        return Mapper.user(users.save(target));
    }
}
