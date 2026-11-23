package com.ims.service;

import com.ims.dto.Dtos.*;
import com.ims.entity.*;

public final class Mapper {
    private Mapper() {}

    public static String name(User u) {
        return u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getEmail();
    }
    public static UserResponse user(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getRole(), u.isActive(), u.getFullName());
    }
    public static StudentResponse student(Student s) {
        return new StudentResponse(s.getId(), s.getStudentNumber(), s.getName(), s.getCourse(),
                s.getContactDetails(), s.getUser().getEmail(), s.getUser().getId());
    }
    public static CompanyResponse company(Company c) {
        return new CompanyResponse(c.getId(), c.getCompanyName(), c.getAddress(), c.getContactPerson(),
                c.getDescription(), c.getApprovalStatus(), c.getUser().getEmail());
    }
    public static InternshipResponse internship(Internship i, long accepted) {
        return new InternshipResponse(i.getId(), i.getTitle(), i.getDescription(), i.getRequirements(), i.getLocation(),
                i.getAvailableSeats(), accepted, i.getDeadline(), i.getCompany().getId(), i.getCompany().getCompanyName());
    }
    public static ApplicationResponse application(Application a) {
        return new ApplicationResponse(a.getId(), a.getStudent().getId(), a.getStudent().getName(),
                a.getStudent().getStudentNumber(), a.getInternship().getId(), a.getInternship().getTitle(),
                a.getInternship().getCompany().getCompanyName(), a.getApplicationDate(), a.getDocumentPath(), a.getStatus());
    }
    public static AssignmentResponse assignment(InternshipAssignment a) {
        return new AssignmentResponse(a.getId(), a.getStudent().getId(), a.getStudent().getName(),
                a.getStudent().getStudentNumber(), a.getSupervisor().getId(), name(a.getSupervisor()),
                a.getSupervisor().getEmail(), a.getInternship().getId(), a.getInternship().getTitle(),
                a.getInternship().getCompany().getCompanyName(), a.getStartDate(), a.getEndDate(), a.getStatus());
    }
    public static FeedbackResponse feedback(Feedback f) {
        return new FeedbackResponse(f.getId(), name(f.getSupervisor()), f.getComments(), f.getFeedbackDate());
    }
    public static EvaluationResponse evaluation(Evaluation e) {
        return new EvaluationResponse(e.getId(), e.getAssignment().getId(), name(e.getEvaluator()),
                e.getEvaluatorRole(), e.getScore(), e.getComments(), e.getEvaluationDate());
    }
}
