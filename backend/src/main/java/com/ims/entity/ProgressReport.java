package com.ims.entity;

import com.ims.entity.Enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProgressReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "assignment_id", nullable = false)
    private InternshipAssignment assignment;
    @Column(nullable = false)
    private String reportingPeriod;
    @Column(columnDefinition = "TEXT")
    private String workCompleted;
    @Column(columnDefinition = "TEXT")
    private String challenges;
    private LocalDateTime submissionDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default
    private ReportStatus status = ReportStatus.SUBMITTED;
}
