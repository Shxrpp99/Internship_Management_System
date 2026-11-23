package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.entity.Enums.ApprovalStatus;
import com.ims.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final ProfileService profiles;

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyCreateRequest request) {
        CompanyResponse created = profiles.createCompany(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','COMPANY')")
    public CompanyResponse update(@PathVariable Long id, @Valid @RequestBody CompanyRequest r) {
        return profiles.updateCompany(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        profiles.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<CompanyResponse> all() { return profiles.companiesForCurrentUser(); }

    @GetMapping("/{id}")
    public CompanyResponse get(@PathVariable Long id) { return profiles.company(id); }

    @PutMapping("/{id}/approve") @PreAuthorize("hasRole('ADMIN')")
    public CompanyResponse approve(@PathVariable Long id,
                                   @RequestParam(defaultValue = "APPROVED") ApprovalStatus status) {
        return profiles.setApproval(id, status);
    }
}
