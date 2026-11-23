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
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InternshipService {
    private final InternshipRepository internships;
    private final CompanyRepository companies;
    private final ApplicationRepository applications;
    private final AssignmentRepository assignments;
    private final CurrentUserService current;

    private InternshipResponse dto(Internship i) {
        return Mapper.internship(i, applications.countByInternshipIdAndStatus(i.getId(), ApplicationStatus.ACCEPTED));
    }

    public InternshipResponse create(InternshipRequest r) {
        Company c = companies.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.badRequest("Create your company profile first"));
        if (c.getApprovalStatus() != ApprovalStatus.APPROVED)
            throw ApiException.forbidden("Your company must be approved by an admin before posting internships");
        if (r.deadline().isBefore(LocalDate.now())) throw ApiException.badRequest("Deadline cannot be in the past");
        Internship i = internships.save(Internship.builder().title(r.title()).description(r.description())
                .requirements(r.requirements()).location(r.location()).availableSeats(r.availableSeats())
                .deadline(r.deadline()).company(c).build());
        return dto(i);
    }

    public InternshipResponse update(Long id, InternshipRequest r) {
        User user = current.get();
        Internship i = internships.findById(id)
                .orElseThrow(() -> ApiException.notFound("Internship not found"));
        if (!i.getCompany().getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only update your own internships");
        if (r.deadline().isBefore(LocalDate.now()))
            throw ApiException.badRequest("Deadline cannot be in the past");
        long accepted = applications.countByInternshipIdAndStatus(i.getId(), ApplicationStatus.ACCEPTED);
        if (r.availableSeats() < accepted)
            throw ApiException.conflict("Available seats cannot be less than the number of accepted applications (" + accepted + ")");
        i.setTitle(r.title());
        i.setDescription(r.description());
        i.setRequirements(r.requirements());
        i.setLocation(r.location());
        i.setAvailableSeats(r.availableSeats());
        i.setDeadline(r.deadline());
        return dto(internships.save(i));
    }

    public void delete(Long id) {
        User user = current.get();
        Internship i = internships.findById(id)
                .orElseThrow(() -> ApiException.notFound("Internship not found"));
        if (!i.getCompany().getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only delete your own internships");
        if (applications.existsByInternshipId(id) || assignments.existsByInternshipId(id))
            throw ApiException.conflict("Internships with applications or assignments cannot be deleted");
        internships.delete(i);
    }

    private static boolean has(String value, String q) {
        return q == null || q.isBlank() || (value != null && value.toLowerCase().contains(q.trim().toLowerCase()));
    }

    @Transactional(readOnly = true)
    public List<InternshipResponse> search(String title, String company, String location, LocalDate deadline) {
        return internships.findAll().stream()
                .filter(i -> has(i.getTitle(), title) && has(i.getCompany().getCompanyName(), company)
                        && has(i.getLocation(), location)
                        && (deadline == null || !i.getDeadline().isAfter(deadline)))
                .sorted(Comparator.comparing(Internship::getDeadline))
                .map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public List<InternshipResponse> mine() {
        Company c = companies.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Company profile not found"));
        return internships.findByCompanyId(c.getId()).stream().map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public InternshipResponse get(Long id) {
        return dto(internships.findById(id).orElseThrow(() -> ApiException.notFound("Internship not found")));
    }
}
