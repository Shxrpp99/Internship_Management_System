package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reports;

    @PostMapping @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReportResponse> submit(@Valid @RequestBody ReportRequest r) {
        ReportResponse created = reports.submit(r);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('STUDENT')")
    public ReportResponse update(@PathVariable Long id, @Valid @RequestBody ReportRequest r) {
        return reports.update(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reports.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ReportResponse> all(@RequestParam(required = false) Long assignmentId) {
        return reports.listForCurrentUser(assignmentId);
    }

    @GetMapping("/{id}")
    public ReportResponse get(@PathVariable Long id) { return reports.get(id); }

    @PostMapping("/{id}/feedback") @PreAuthorize("hasRole('SUPERVISOR')")
    public ReportResponse feedback(@PathVariable Long id, @Valid @RequestBody FeedbackRequest r) {
        return reports.addFeedback(id, r);
    }
}
