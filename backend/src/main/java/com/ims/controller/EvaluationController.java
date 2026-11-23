package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {
    private final EvaluationService evaluations;

    @PostMapping @PreAuthorize("hasAnyRole('COMPANY','SUPERVISOR')")
    public ResponseEntity<EvaluationResponse> submit(@Valid @RequestBody EvaluationRequest r) {
        EvaluationResponse created = evaluations.submit(r);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('COMPANY','SUPERVISOR')")
    public EvaluationResponse update(@PathVariable Long id, @Valid @RequestBody EvaluationRequest r) {
        return evaluations.update(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('COMPANY','SUPERVISOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        evaluations.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<EvaluationResponse> all(@RequestParam(required = false) Long assignmentId) {
        return evaluations.listForCurrentUser(assignmentId);
    }

    @GetMapping("/{id}")
    public EvaluationResponse get(@PathVariable Long id) { return evaluations.get(id); }
}
