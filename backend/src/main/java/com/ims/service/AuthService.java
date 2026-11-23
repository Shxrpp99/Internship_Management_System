package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import com.ims.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository users;
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    private static boolean blank(String s) { return s == null || s.isBlank(); }

    public AuthResponse register(RegisterRequest r) {
        if (r.role() != Role.STUDENT && r.role() != Role.COMPANY)
            throw ApiException.forbidden("Only student and company accounts can self-register");
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw ApiException.conflict("Email is already registered");
        if (r.role() == Role.STUDENT) {
            if (blank(r.fullName()) || blank(r.studentNumber()))
                throw ApiException.badRequest("Name and student number are required for students");
            if (students.existsByStudentNumber(r.studentNumber().trim()))
                throw ApiException.conflict("Student number is already registered");
        }
        if (r.role() == Role.COMPANY && blank(r.companyName()))
            throw ApiException.badRequest("Company name is required for companies");

        String display = r.role() == Role.COMPANY ? r.companyName() : r.fullName();
        User u = users.save(User.builder().email(email).passwordHash(encoder.encode(r.password()))
                .role(r.role()).active(true).fullName(display).build());
        if (r.role() == Role.STUDENT) {
            students.save(Student.builder().studentNumber(r.studentNumber().trim()).name(r.fullName())
                    .course(r.course()).contactDetails(r.contactDetails()).user(u).build());
        } else if (r.role() == Role.COMPANY) {
            companies.save(Company.builder().companyName(r.companyName()).address(r.address())
                    .contactPerson(r.contactPerson()).description(r.description())
                    .approvalStatus(ApprovalStatus.PENDING).user(u).build());
        }
        return response(u);
    }

    public UserResponse me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User u = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        return new UserResponse(u.getId(), u.getEmail(), u.getRole(), u.isActive(), u.getFullName());
    }

    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!u.isActive()) throw ApiException.forbidden("This account has been disabled");
        return response(u);
    }

    private AuthResponse response(User u) {
        Long profileId = switch (u.getRole()) {
            case STUDENT -> students.findByUserId(u.getId()).map(Student::getId).orElse(null);
            case COMPANY -> companies.findByUserId(u.getId()).map(Company::getId).orElse(null);
            default -> null;
        };
        return new AuthResponse(jwt.generate(u.getEmail(), u.getRole().name()), u.getEmail(), u.getRole(),
                u.getId(), profileId, u.getFullName());
    }
}
