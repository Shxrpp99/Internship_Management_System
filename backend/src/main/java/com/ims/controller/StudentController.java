package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final ProfileService profiles;

    @GetMapping
    public List<StudentResponse> all() { return profiles.studentsForCurrentUser(); }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentCreateRequest request) {
        StudentResponse created = profiles.createStudent(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) { return profiles.student(id); }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest r) {
        return profiles.updateStudent(id, r);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        profiles.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
