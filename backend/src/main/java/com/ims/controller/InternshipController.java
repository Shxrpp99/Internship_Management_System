package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.InternshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {
    private final InternshipService internships;

    @PostMapping @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<InternshipResponse> create(@Valid @RequestBody InternshipRequest r) {
        InternshipResponse created = internships.create(r);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('COMPANY')")
    public InternshipResponse update(@PathVariable Long id, @Valid @RequestBody InternshipRequest r) {
        return internships.update(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        internships.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<InternshipResponse> search(@RequestParam(required = false) String title,
                                           @RequestParam(required = false) String company,
                                           @RequestParam(required = false) String location,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadline) {
        return internships.search(title, company, location, deadline);
    }

    @GetMapping("/{id}")
    public InternshipResponse get(@PathVariable Long id) { return internships.get(id); }
}
