package com.ims.config;

import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final InternshipRepository internships;
    private final PasswordEncoder encoder;

    private User user(String email, Role role, String name) {
        return users.save(User.builder().email(email).passwordHash(encoder.encode("password123"))
                .role(role).active(true).fullName(name).build());
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;
        user("admin@college.edu", Role.ADMIN, "System Admin");
        user("supervisor@college.edu", Role.SUPERVISOR, "Dr. Sarah Supervisor");

        User cu = user("company@techcorp.com", Role.COMPANY, "TechCorp Ltd");
        Company c = companies.save(Company.builder().companyName("TechCorp Ltd").address("12 Innovation Street, Kathmandu")
                .contactPerson("Jane Doe").description("Software company building cloud products.")
                .approvalStatus(ApprovalStatus.APPROVED).user(cu).build());
        internships.save(Internship.builder().title("Java Backend Intern").location("Kathmandu")
                .description("Work on Spring Boot microservices with an experienced team.")
                .requirements("Java, Spring Boot, SQL basics").availableSeats(2)
                .deadline(LocalDate.now().plusDays(60)).company(c).build());
        internships.save(Internship.builder().title("React Frontend Intern").location("Remote")
                .description("Build modern UIs with React and Bootstrap.")
                .requirements("JavaScript, React, HTML/CSS").availableSeats(1)
                .deadline(LocalDate.now().plusDays(45)).company(c).build());

        User su = user("student@college.edu", Role.STUDENT, "Sam Student");
        students.save(Student.builder().studentNumber("S1001").name("Sam Student").course("BSc Computing")
                .contactDetails("+977-9800000000").user(su).build());
        log.info("Seeded demo data. All accounts use password: password123");
    }
}
