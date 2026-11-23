package com.ims.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id", nullable = false)
    private ProgressReport report;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;
    @Column(columnDefinition = "TEXT")
    private String comments;
    private LocalDateTime feedbackDate;
}
