package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentService {
    private final AssignmentRepository assignments;
    private final StudentRepository students;
    private final InternshipRepository internships;
    private final ApplicationRepository applications;
    private final UserRepository users;
    private final CompanyRepository companies;
    private final ReportRepository reports;
    private final EvaluationRepository evaluations;
    private final CurrentUserService current;

    public AssignmentResponse create(AssignmentRequest r) {
        validateDates(r.startDate(), r.endDate());
        Student s = students.findById(r.studentId()).orElseThrow(() -> ApiException.notFound("Student not found"));
        Internship i = internships.findById(r.internshipId()).orElseThrow(() -> ApiException.notFound("Internship not found"));
        User sup = users.findById(r.supervisorId()).orElseThrow(() -> ApiException.notFound("Supervisor not found"));
        if (sup.getRole() != Role.SUPERVISOR) throw ApiException.badRequest("Selected user is not a supervisor");
        boolean accepted = applications.findByStudentIdAndInternshipId(s.getId(), i.getId())
                .map(a -> a.getStatus() == ApplicationStatus.ACCEPTED).orElse(false);
        if (!accepted) throw ApiException.badRequest("A supervisor can only be assigned to students with an ACCEPTED application");
        if (assignments.existsByStudentIdAndInternshipId(s.getId(), i.getId()))
            throw ApiException.conflict("This student already has a supervisor for this internship");
        InternshipAssignment a = assignments.save(InternshipAssignment.builder().student(s).supervisor(sup).internship(i)
                .startDate(r.startDate() != null ? r.startDate() : LocalDate.now()).endDate(r.endDate())
                .status(AssignmentStatus.ACTIVE).build());
        return Mapper.assignment(a);
    }

    public AssignmentResponse update(Long id, AssignmentRequest r) {
        validateDates(r.startDate(), r.endDate());
        InternshipAssignment a = assignments.findById(id)
                .orElseThrow(() -> ApiException.notFound("Assignment not found"));
        Student s = students.findById(r.studentId())
                .orElseThrow(() -> ApiException.notFound("Student not found"));
        Internship i = internships.findById(r.internshipId())
                .orElseThrow(() -> ApiException.notFound("Internship not found"));
        User supervisor = users.findById(r.supervisorId())
                .orElseThrow(() -> ApiException.notFound("Supervisor not found"));
        if (supervisor.getRole() != Role.SUPERVISOR)
            throw ApiException.badRequest("Selected user is not a supervisor");
        boolean accepted = applications.findByStudentIdAndInternshipId(s.getId(), i.getId())
                .map(application -> application.getStatus() == ApplicationStatus.ACCEPTED).orElse(false);
        if (!accepted)
            throw ApiException.badRequest("A supervisor can only be assigned to students with an ACCEPTED application");
        boolean relationshipChanged = !a.getStudent().getId().equals(s.getId())
                || !a.getInternship().getId().equals(i.getId());
        if (relationshipChanged && (reports.existsByAssignmentId(id) || evaluations.existsByAssignmentId(id)))
            throw ApiException.conflict("Assignments with reports or evaluations cannot be moved to another student or internship");
        if ((!a.getStudent().getId().equals(s.getId()) || !a.getInternship().getId().equals(i.getId()))
                && assignments.existsByStudentIdAndInternshipId(s.getId(), i.getId()))
            throw ApiException.conflict("This student already has a supervisor for this internship");
        a.setStudent(s);
        a.setInternship(i);
        a.setSupervisor(supervisor);
        a.setStartDate(r.startDate() != null ? r.startDate() : LocalDate.now());
        a.setEndDate(r.endDate());
        return Mapper.assignment(assignments.save(a));
    }

    public void delete(Long id) {
        InternshipAssignment a = assignments.findById(id)
                .orElseThrow(() -> ApiException.notFound("Assignment not found"));
        if (reports.existsByAssignmentId(id) || evaluations.existsByAssignmentId(id))
            throw ApiException.conflict("Assignments with reports or evaluations cannot be deleted");
        assignments.delete(a);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate))
            throw ApiException.badRequest("End date cannot be before start date");
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> all() {
        return assignments.findAll().stream().map(Mapper::assignment).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listForCurrentUser() {
        return switch (current.get().getRole()) {
            case ADMIN -> all();
            case STUDENT -> forStudent();
            case SUPERVISOR -> forSupervisor();
            case COMPANY -> forCompany();
        };
    }

    @Transactional(readOnly = true)
    public AssignmentResponse get(Long id) {
        return Mapper.assignment(access(id, current.get(), true));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> forSupervisor() {
        return assignments.findBySupervisorId(current.get().getId()).stream().map(Mapper::assignment).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> forStudent() {
        Student s = students.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found"));
        return assignments.findByStudentId(s.getId()).stream().map(Mapper::assignment).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> forCompany() {
        Company c = companies.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Company profile not found"));
        return assignments.findByInternshipCompanyId(c.getId()).stream().map(Mapper::assignment).toList();
    }

    /** Central access rule used by reports and evaluations. */
    @Transactional(readOnly = true)
    public InternshipAssignment access(Long id, User u, boolean includeCompany) {
        InternshipAssignment a = assignments.findById(id).orElseThrow(() -> ApiException.notFound("Assignment not found"));
        boolean ok = switch (u.getRole()) {
            case ADMIN -> true;
            case STUDENT -> a.getStudent().getUser().getId().equals(u.getId());
            case SUPERVISOR -> a.getSupervisor().getId().equals(u.getId());
            case COMPANY -> includeCompany && a.getInternship().getCompany().getUser().getId().equals(u.getId());
        };
        if (!ok) throw ApiException.forbidden("You do not have access to this assignment");
        return a;
    }
}
