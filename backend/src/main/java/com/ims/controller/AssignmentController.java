package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignments;

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest r) {
        AssignmentResponse created = assignments.create(r);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public AssignmentResponse update(@PathVariable Long id, @Valid @RequestBody AssignmentRequest r) {
        return assignments.update(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignments.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<AssignmentResponse> all() { return assignments.listForCurrentUser(); }

    @GetMapping("/{id}")
    public AssignmentResponse get(@PathVariable Long id) { return assignments.get(id); }

}
