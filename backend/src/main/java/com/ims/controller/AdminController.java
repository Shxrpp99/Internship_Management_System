package com.ims.controller;

import com.ims.dto.Dtos.UserResponse;
import com.ims.dto.Dtos.ManagedUserCreateRequest;
import com.ims.dto.Dtos.ManagedUserUpdateRequest;
import com.ims.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService admin;

    @GetMapping("/stats")
    public Map<String, Long> stats() { return admin.stats(); }

    @GetMapping("/users")
    public List<UserResponse> users() { return admin.users(); }

    @GetMapping("/users/{id}")
    public UserResponse user(@PathVariable Long id) { return admin.user(id); }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody ManagedUserCreateRequest request) {
        UserResponse created = admin.createUser(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody ManagedUserUpdateRequest request) {
        return admin.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        admin.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
