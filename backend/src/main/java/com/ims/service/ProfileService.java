package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final AssignmentRepository assignments;
    private final ApplicationRepository applications;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final InternshipRepository internships;
    private final CurrentUserService current;

    // ---- students ----
    public List<StudentResponse> allStudents() {
        return students.findAll().stream().map(Mapper::student).toList();
    }

    public List<StudentResponse> studentsForCurrentUser() {
        User user = current.get();
        return switch (user.getRole()) {
            case ADMIN -> allStudents();
            case STUDENT -> List.of(myStudent());
            case SUPERVISOR -> assignments.findBySupervisorId(user.getId()).stream()
                    .map(InternshipAssignment::getStudent).distinct().map(Mapper::student).toList();
            case COMPANY -> throw ApiException.forbidden("Companies cannot list student profiles");
        };
    }

    public StudentResponse myStudent() {
        return Mapper.student(students.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found")));
    }

    public StudentResponse createStudent(StudentCreateRequest request) {
        String email = request.email().trim().toLowerCase();
        String studentNumber = request.studentNumber().trim();
        if (users.existsByEmail(email)) throw ApiException.conflict("Email is already registered");
        if (students.existsByStudentNumber(studentNumber))
            throw ApiException.conflict("Student number is already registered");
        User user = users.save(User.builder().email(email)
                .passwordHash(passwordEncoder.encode(request.password())).role(Role.STUDENT)
                .active(true).fullName(request.name().trim()).build());
        Student student = students.save(Student.builder().studentNumber(studentNumber)
                .name(request.name().trim()).course(request.course()).contactDetails(request.contactDetails())
                .user(user).build());
        return Mapper.student(student);
    }

    public StudentResponse student(Long id) {
        User u = current.get();
        Student s = students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
        boolean ok = u.getRole() == Role.ADMIN
                || (u.getRole() == Role.STUDENT && s.getUser().getId().equals(u.getId()))
                || (u.getRole() == Role.SUPERVISOR && assignments.existsBySupervisorIdAndStudentId(u.getId(), s.getId()));
        if (!ok) throw ApiException.forbidden("You cannot view this student");
        return Mapper.student(s);
    }

    public StudentResponse updateStudent(Long id, StudentRequest r) {
        User u = current.get();
        Student s = students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
        if (u.getRole() != Role.ADMIN && !s.getUser().getId().equals(u.getId()))
            throw ApiException.forbidden("You can only update your own profile");
        s.setName(r.name());
        s.setCourse(r.course());
        s.setContactDetails(r.contactDetails());
        s.getUser().setFullName(r.name());
        return Mapper.student(students.save(s));
    }

    public void deleteStudent(Long id) {
        Student student = students.findById(id)
                .orElseThrow(() -> ApiException.notFound("Student not found"));
        if (applications.existsByStudentId(id) || assignments.existsByStudentId(id))
            throw ApiException.conflict("Students with applications or assignments cannot be deleted");
        User user = student.getUser();
        students.delete(student);
        users.delete(user);
    }

    // ---- companies ----
    /** Creates or updates the logged-in company's profile. */
    public CompanyResponse saveCompany(CompanyRequest r) {
        User u = current.get();
        Company c = companies.findByUserId(u.getId()).orElseGet(() ->
                Company.builder().user(u).approvalStatus(ApprovalStatus.PENDING).build());
        c.setCompanyName(r.companyName());
        c.setAddress(r.address());
        c.setContactPerson(r.contactPerson());
        c.setDescription(r.description());
        u.setFullName(r.companyName());
        return Mapper.company(companies.save(c));
    }

    public CompanyResponse createCompany(CompanyCreateRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw ApiException.conflict("Email is already registered");
        User user = users.save(User.builder().email(email)
                .passwordHash(passwordEncoder.encode(request.password())).role(Role.COMPANY)
                .active(true).fullName(request.companyName().trim()).build());
        Company company = companies.save(Company.builder().companyName(request.companyName().trim())
                .address(request.address()).contactPerson(request.contactPerson()).description(request.description())
                .approvalStatus(ApprovalStatus.PENDING).user(user).build());
        return Mapper.company(company);
    }

    public CompanyResponse company(Long id) {
        User user = current.get();
        Company company = companies.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        if (user.getRole() != Role.ADMIN && !company.getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only view your own company profile");
        return Mapper.company(company);
    }

    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        User user = current.get();
        Company company = companies.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        if (user.getRole() != Role.ADMIN && !company.getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only update your own company profile");
        company.setCompanyName(request.companyName());
        company.setAddress(request.address());
        company.setContactPerson(request.contactPerson());
        company.setDescription(request.description());
        company.getUser().setFullName(request.companyName());
        return Mapper.company(companies.save(company));
    }

    public void deleteCompany(Long id) {
        Company company = companies.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        if (internships.existsByCompanyId(id))
            throw ApiException.conflict("Companies with internships cannot be deleted");
        User user = company.getUser();
        companies.delete(company);
        users.delete(user);
    }

    public List<CompanyResponse> allCompanies() {
        return companies.findAll().stream().map(Mapper::company).toList();
    }

    public List<CompanyResponse> companiesForCurrentUser() {
        User user = current.get();
        if (user.getRole() == Role.ADMIN) return allCompanies();
        if (user.getRole() != Role.COMPANY)
            throw ApiException.forbidden("You cannot list company profiles");
        return companies.findByUserId(user.getId()).map(company -> List.of(Mapper.company(company)))
                .orElseThrow(() -> ApiException.notFound("Company profile not found"));
    }

    public CompanyResponse myCompany() {
        return Mapper.company(companies.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Company profile not found")));
    }

    public CompanyResponse setApproval(Long id, ApprovalStatus status) {
        Company c = companies.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        c.setApprovalStatus(status);
        return Mapper.company(companies.save(c));
    }
}
