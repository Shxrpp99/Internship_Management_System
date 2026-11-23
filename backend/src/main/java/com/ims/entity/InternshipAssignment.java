package com.ims.entity;

import com.ims.entity.Enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;
    private LocalDate startDate;
    private LocalDate endDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default
    private AssignmentStatus status = AssignmentStatus.ACTIVE;
}
