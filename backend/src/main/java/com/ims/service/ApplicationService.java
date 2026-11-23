package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {
    private final ApplicationRepository applications;
    private final InternshipRepository internships;
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final FileStorageService storage;
    private final CurrentUserService current;

    public ApplicationResponse apply(Long internshipId, MultipartFile file) {
        User u = current.get();
        Student s = students.findByUserId(u.getId())
                .orElseThrow(() -> ApiException.badRequest("Student profile not found"));
        Internship i = internships.findById(internshipId)
                .orElseThrow(() -> ApiException.notFound("Internship not found"));
        if (LocalDate.now().isAfter(i.getDeadline()))
            throw ApiException.badRequest("The application deadline for this internship has passed");
        if (applications.existsByStudentIdAndInternshipId(s.getId(), i.getId()))
            throw ApiException.conflict("You have already applied to this internship");
        String stored = storage.store(file);
        Application a = applications.save(Application.builder().student(s).internship(i)
                .applicationDate(LocalDateTime.now()).documentPath(stored).status(ApplicationStatus.PENDING).build());
        return Mapper.application(a);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> mine() {
        Student s = students.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found"));
        return applications.findByStudentId(s.getId()).stream().map(Mapper::application).toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> listForCurrentUser() {
        User user = current.get();
        return switch (user.getRole()) {
            case ADMIN -> all();
            case STUDENT -> mine();
            case COMPANY -> {
                Company company = companies.findByUserId(user.getId())
                        .orElseThrow(() -> ApiException.notFound("Company profile not found"));
                yield applications.findByInternshipCompanyId(company.getId()).stream()
                        .map(Mapper::application).toList();
            }
            default -> throw ApiException.forbidden("You cannot view applications");
        };
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> forInternship(Long internshipId) {
        User u = current.get();
        Internship i = internships.findById(internshipId)
                .orElseThrow(() -> ApiException.notFound("Internship not found"));
        if (u.getRole() == Role.COMPANY && !i.getCompany().getUser().getId().equals(u.getId()))
            throw ApiException.forbidden("This internship belongs to another company");
        return applications.findByInternshipId(internshipId).stream().map(Mapper::application).toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> all() {
        return applications.findAll().stream().map(Mapper::application).toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(Long id) {
        User user = current.get();
        Application application = applications.findById(id)
                .orElseThrow(() -> ApiException.notFound("Application not found"));
        boolean allowed = user.getRole() == Role.ADMIN
                || (user.getRole() == Role.STUDENT && application.getStudent().getUser().getId().equals(user.getId()))
                || (user.getRole() == Role.COMPANY
                    && application.getInternship().getCompany().getUser().getId().equals(user.getId()));
        if (!allowed) throw ApiException.forbidden("You cannot view this application");
        return Mapper.application(application);
    }

    public ApplicationResponse updateStatus(Long id, ApplicationStatus status) {
        User u = current.get();
        Application a = applications.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        Internship i = a.getInternship();
        if (!i.getCompany().getUser().getId().equals(u.getId()))
            throw ApiException.forbidden("You can only manage applications for your own internships");
        if (status == ApplicationStatus.PENDING) throw ApiException.badRequest("Status must be ACCEPTED or REJECTED");
        if (status == ApplicationStatus.ACCEPTED && a.getStatus() != ApplicationStatus.ACCEPTED) {
            long accepted = applications.countByInternshipIdAndStatus(i.getId(), ApplicationStatus.ACCEPTED);
            if (accepted >= i.getAvailableSeats())
                throw ApiException.badRequest("No seats left: all " + i.getAvailableSeats() + " seats are already filled");
        }
        a.setStatus(status);
        return Mapper.application(applications.save(a));
    }

    public void cancel(Long id) {
        User user = current.get();
        Application a = applications.findById(id)
                .orElseThrow(() -> ApiException.notFound("Application not found"));
        if (user.getRole() != Role.STUDENT || !a.getStudent().getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only cancel your own application");
        if (a.getStatus() != ApplicationStatus.PENDING)
            throw ApiException.conflict("Only pending applications can be cancelled");
        storage.delete(a.getDocumentPath());
        applications.delete(a);
    }

    /** Only the owning student, the owning company or an admin may download a document. */
    @Transactional(readOnly = true)
    public void authorizeDocument(String filename) {
        User u = current.get();
        Application a = applications.findByDocumentPath(filename)
                .orElseThrow(() -> ApiException.notFound("File not found"));
        boolean ok = u.getRole() == Role.ADMIN
                || (u.getRole() == Role.STUDENT && a.getStudent().getUser().getId().equals(u.getId()))
                || (u.getRole() == Role.COMPANY && a.getInternship().getCompany().getUser().getId().equals(u.getId()));
        if (!ok) throw ApiException.forbidden("You cannot access this file");
    }
}
