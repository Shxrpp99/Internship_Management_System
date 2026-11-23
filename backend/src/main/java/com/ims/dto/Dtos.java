package com.ims.dto;

import com.ims.entity.Enums.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {
    // ---- requests ----
    public record RegisterRequest(@NotBlank @Email String email,
                                  @NotBlank @Size(min = 12, message = "must be at least 12 characters") String password,
                                  @NotNull Role role, @Size(max = 120) String fullName,
                                  @Size(max = 80) String studentNumber, @Size(max = 120) String course,
                                  @Size(max = 500) String contactDetails, @Size(max = 160) String companyName,
                                  @Size(max = 300) String address, @Size(max = 120) String contactPerson,
                                  @Size(max = 4000) String description) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank @Size(max = 200) String password) {}
    public record StudentCreateRequest(@NotBlank @Email String email,
                                       @NotBlank @Size(min = 12, max = 200) String password,
                                       @NotBlank @Size(max = 80) String studentNumber,
                                       @NotBlank @Size(max = 120) String name,
                                       @Size(max = 120) String course,
                                       @Size(max = 500) String contactDetails) {}
    public record CompanyCreateRequest(@NotBlank @Email String email,
                                       @NotBlank @Size(min = 12, max = 200) String password,
                                       @NotBlank @Size(max = 160) String companyName,
                                       @Size(max = 300) String address,
                                       @Size(max = 120) String contactPerson,
                                       @Size(max = 4000) String description) {}
    public record ManagedUserCreateRequest(@NotBlank @Email String email,
                                           @NotBlank @Size(min = 12, max = 200) String password,
                                           @NotNull Role role, @NotBlank @Size(max = 120) String fullName) {}
    public record ManagedUserUpdateRequest(@Size(max = 120) String fullName, @NotNull Boolean active) {}
    public record StudentRequest(@NotBlank @Size(max = 120) String name,
                                 @Size(max = 120) String course, @Size(max = 500) String contactDetails) {}
    public record CompanyRequest(@NotBlank @Size(max = 160) String companyName,
                                 @Size(max = 300) String address, @Size(max = 120) String contactPerson,
                                 @Size(max = 4000) String description) {}
    public record InternshipRequest(@NotBlank @Size(max = 180) String title,
                                    @Size(max = 10000) String description, @Size(max = 10000) String requirements,
                                    @NotBlank @Size(max = 180) String location, @NotNull @Min(1) @Max(10000) Integer availableSeats,
                                    @NotNull @FutureOrPresent LocalDate deadline) {}
    public record StatusRequest(@NotNull ApplicationStatus status) {}
    public record AssignmentRequest(@NotNull @Positive Long studentId, @NotNull @Positive Long internshipId,
                                    @NotNull @Positive Long supervisorId,
                                    LocalDate startDate, LocalDate endDate) {}
    public record ReportRequest(@NotNull @Positive Long assignmentId,
                                @NotBlank @Size(max = 120) String reportingPeriod,
                                @NotBlank @Size(max = 20000) String workCompleted,
                                @Size(max = 10000) String challenges) {}
    public record FeedbackRequest(@NotBlank @Size(max = 10000) String comments, @NotNull ReportStatus status) {}
    public record EvaluationRequest(@NotNull @Positive Long assignmentId,
                                    @NotNull @Min(1) @Max(100) Integer score,
                                    @NotBlank @Size(max = 10000) String comments) {}

    // ---- responses ----
    public record AuthResponse(String token, String email, Role role, Long userId, Long profileId, String fullName) {}
    public record UserResponse(Long id, String email, Role role, boolean active, String fullName) {}
    public record StudentResponse(Long id, String studentNumber, String name, String course, String contactDetails,
                                  String email, Long userId) {}
    public record CompanyResponse(Long id, String companyName, String address, String contactPerson,
                                  String description, ApprovalStatus approvalStatus, String email) {}
    public record InternshipResponse(Long id, String title, String description, String requirements, String location,
                                     int availableSeats, long acceptedCount, LocalDate deadline,
                                     Long companyId, String companyName) {}
    public record ApplicationResponse(Long id, Long studentId, String studentName, String studentNumber,
                                      Long internshipId, String internshipTitle, String companyName,
                                      LocalDateTime applicationDate, String documentPath, ApplicationStatus status) {}
    public record AssignmentResponse(Long id, Long studentId, String studentName, String studentNumber,
                                     Long supervisorId, String supervisorName, String supervisorEmail,
                                     Long internshipId, String internshipTitle, String companyName,
                                     LocalDate startDate, LocalDate endDate, AssignmentStatus status) {}
    public record FeedbackResponse(Long id, String supervisorName, String comments, LocalDateTime feedbackDate) {}
    public record ReportResponse(Long id, Long assignmentId, String studentName, String internshipTitle,
                                 String reportingPeriod, String workCompleted, String challenges,
                                 LocalDateTime submissionDate, ReportStatus status, List<FeedbackResponse> feedback) {}
    public record EvaluationResponse(Long id, Long assignmentId, String evaluatorName, Role evaluatorRole,
                                     int score, String comments, LocalDateTime evaluationDate) {}
}
