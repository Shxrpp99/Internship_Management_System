package com.ims.entity;

import com.ims.entity.Enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application", uniqueConstraints = @UniqueConstraint(name = "uk_student_internship", columnNames = {"student_id", "internship_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;
    private LocalDateTime applicationDate;
    private String documentPath;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;
}
