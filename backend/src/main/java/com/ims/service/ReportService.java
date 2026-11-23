package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;
import com.ims.entity.Enums.*;
import com.ims.exception.ApiException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {
    private final ReportRepository reports;
    private final FeedbackRepository feedbacks;
    private final StudentRepository students;
    private final CompanyRepository companies;
    private final AssignmentService assignmentService;
    private final CurrentUserService current;

    private ReportResponse dto(ProgressReport r) {
        List<FeedbackResponse> fb = feedbacks.findByReportIdOrderByFeedbackDateAsc(r.getId())
                .stream().map(Mapper::feedback).toList();
        InternshipAssignment a = r.getAssignment();
        return new ReportResponse(r.getId(), a.getId(), a.getStudent().getName(), a.getInternship().getTitle(),
                r.getReportingPeriod(), r.getWorkCompleted(), r.getChallenges(), r.getSubmissionDate(), r.getStatus(), fb);
    }

    public ReportResponse submit(ReportRequest req) {
        User u = current.get();
        InternshipAssignment a = assignmentService.access(req.assignmentId(), u, false);
        if (u.getRole() != Role.STUDENT) throw ApiException.forbidden("Only students can submit reports");
        ProgressReport r = reports.save(ProgressReport.builder().assignment(a).reportingPeriod(req.reportingPeriod())
                .workCompleted(req.workCompleted()).challenges(req.challenges())
                .submissionDate(LocalDateTime.now()).status(ReportStatus.SUBMITTED).build());
        return dto(r);
    }

    public ReportResponse update(Long id, ReportRequest req) {
        User user = current.get();
        ProgressReport report = reports.findById(id)
                .orElseThrow(() -> ApiException.notFound("Report not found"));
        if (user.getRole() != Role.STUDENT
                || !report.getAssignment().getStudent().getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only update your own reports");
        if (report.getStatus() != ReportStatus.SUBMITTED)
            throw ApiException.conflict("Only reports awaiting review can be updated");
        if (!report.getAssignment().getId().equals(req.assignmentId()))
            throw ApiException.badRequest("A report cannot be moved to another assignment");
        report.setReportingPeriod(req.reportingPeriod());
        report.setWorkCompleted(req.workCompleted());
        report.setChallenges(req.challenges());
        return dto(reports.save(report));
    }

    public void delete(Long id) {
        User user = current.get();
        ProgressReport report = reports.findById(id)
                .orElseThrow(() -> ApiException.notFound("Report not found"));
        if (user.getRole() != Role.STUDENT
                || !report.getAssignment().getStudent().getUser().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only delete your own reports");
        if (report.getStatus() != ReportStatus.SUBMITTED)
            throw ApiException.conflict("Reviewed reports cannot be deleted");
        if (!feedbacks.findByReportIdOrderByFeedbackDateAsc(id).isEmpty())
            throw ApiException.conflict("Reports with feedback cannot be deleted");
        reports.delete(report);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> mine() {
        Student s = students.findByUserId(current.get().getId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found"));
        return reports.findByAssignmentStudentIdOrderBySubmissionDateDesc(s.getId()).stream().map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> listForCurrentUser(Long assignmentId) {
        User user = current.get();
        if (assignmentId != null) return forAssignment(assignmentId);
        return switch (user.getRole()) {
            case ADMIN -> reports.findAll().stream().map(this::dto).toList();
            case STUDENT -> mine();
            case SUPERVISOR -> reports.findByAssignmentSupervisorIdOrderBySubmissionDateDesc(user.getId())
                    .stream().map(this::dto).toList();
            case COMPANY -> {
                Company company = companies.findByUserId(user.getId())
                        .orElseThrow(() -> ApiException.notFound("Company profile not found"));
                yield reports.findByAssignmentInternshipCompanyIdOrderBySubmissionDateDesc(company.getId())
                        .stream().map(this::dto).toList();
            }
        };
    }


    @Transactional(readOnly = true)
    public List<ReportResponse> forAssignment(Long assignmentId) {
        assignmentService.access(assignmentId, current.get(), false);
        return reports.findByAssignmentIdOrderBySubmissionDateDesc(assignmentId).stream().map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public ReportResponse get(Long id) {
        ProgressReport report = reports.findById(id)
                .orElseThrow(() -> ApiException.notFound("Report not found"));
        assignmentService.access(report.getAssignment().getId(), current.get(), true);
        return dto(report);
    }

    public ReportResponse addFeedback(Long reportId, FeedbackRequest req) {
        User u = current.get();
        ProgressReport r = reports.findById(reportId).orElseThrow(() -> ApiException.notFound("Report not found"));
        if (!r.getAssignment().getSupervisor().getId().equals(u.getId()))
            throw ApiException.forbidden("You can only review reports of your assigned students");
        if (req.status() == ReportStatus.SUBMITTED)
            throw ApiException.badRequest("Status must be REVIEWED or CHANGES_REQUESTED");
        feedbacks.save(Feedback.builder().report(r).supervisor(u).comments(req.comments())
                .feedbackDate(LocalDateTime.now()).build());
        r.setStatus(req.status());
        return dto(reports.save(r));
    }
}
