package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applications;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> apply(@RequestParam Long internshipId, @RequestParam("file") MultipartFile file) {
        ApplicationResponse created = applications.apply(internshipId, file);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping @PreAuthorize("hasAnyRole('STUDENT','COMPANY','ADMIN')")
    public List<ApplicationResponse> all() { return applications.listForCurrentUser(); }

    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('STUDENT','COMPANY','ADMIN')")
    public ApplicationResponse get(@PathVariable Long id) { return applications.get(id); }

    @PutMapping("/{id}") @PreAuthorize("hasRole('COMPANY')")
    public ApplicationResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        return applications.updateStatus(id, r.status());
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        applications.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
