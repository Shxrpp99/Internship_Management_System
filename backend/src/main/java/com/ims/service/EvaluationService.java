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
public class EvaluationService {
    private final EvaluationRepository evaluations;
    private final AssignmentService assignmentService;
    private final CurrentUserService current;

    public EvaluationResponse submit(EvaluationRequest r) {
        User u = current.get();
        if (u.getRole() != Role.COMPANY && u.getRole() != Role.SUPERVISOR)
            throw ApiException.forbidden("Only companies and supervisors can submit evaluations");
        InternshipAssignment a = assignmentService.access(r.assignmentId(), u, true);
        if (evaluations.existsByAssignmentIdAndEvaluatorId(a.getId(), u.getId()))
            throw ApiException.conflict("You have already submitted an evaluation for this assignment");
        Evaluation e = evaluations.save(Evaluation.builder().assignment(a).evaluator(u).evaluatorRole(u.getRole())
                .score(r.score()).comments(r.comments()).evaluationDate(LocalDateTime.now()).build());
        return Mapper.evaluation(e);
    }

    public EvaluationResponse update(Long id, EvaluationRequest r) {
        User user = current.get();
        Evaluation evaluation = evaluations.findById(id)
                .orElseThrow(() -> ApiException.notFound("Evaluation not found"));
        if (!evaluation.getEvaluator().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only update evaluations you submitted");
        if (!evaluation.getAssignment().getId().equals(r.assignmentId()))
            throw ApiException.badRequest("An evaluation cannot be moved to another assignment");
        assignmentService.access(r.assignmentId(), user, true);
        evaluation.setScore(r.score());
        evaluation.setComments(r.comments());
        return Mapper.evaluation(evaluations.save(evaluation));
    }

    public void delete(Long id) {
        User user = current.get();
        Evaluation evaluation = evaluations.findById(id)
                .orElseThrow(() -> ApiException.notFound("Evaluation not found"));
        if (!evaluation.getEvaluator().getId().equals(user.getId()))
            throw ApiException.forbidden("You can only delete evaluations you submitted");
        evaluations.delete(evaluation);
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> forAssignment(Long assignmentId) {
        assignmentService.access(assignmentId, current.get(), true);
        return evaluations.findByAssignmentId(assignmentId).stream().map(Mapper::evaluation).toList();
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> listForCurrentUser(Long assignmentId) {
        User user = current.get();
        if (assignmentId != null) return forAssignment(assignmentId);
        List<Evaluation> results = switch (user.getRole()) {
            case ADMIN -> evaluations.findAll();
            case STUDENT -> evaluations.findByAssignmentStudentUserId(user.getId());
            case SUPERVISOR -> evaluations.findByAssignmentSupervisorId(user.getId());
            case COMPANY -> evaluations.findByAssignmentInternshipCompanyUserId(user.getId());
        };
        return results.stream().map(Mapper::evaluation).toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse get(Long id) {
        Evaluation evaluation = evaluations.findById(id)
                .orElseThrow(() -> ApiException.notFound("Evaluation not found"));
        assignmentService.access(evaluation.getAssignment().getId(), current.get(), true);
        return Mapper.evaluation(evaluation);
    }
}
