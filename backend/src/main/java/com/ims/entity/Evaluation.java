package com.ims.entity;

import com.ims.entity.Enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "assignment_id", nullable = false)
    private InternshipAssignment assignment;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Role evaluatorRole;
    @Column(nullable = false)
    private int score;
    @Column(columnDefinition = "TEXT")
    private String comments;
    private LocalDateTime evaluationDate;
}
