package com.ims.controller;

import com.ims.dto.Dtos.*;
import com.ims.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r) {
        AuthResponse created = auth.register(r);
        var location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/auth/me").build().toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) { return auth.login(r); }

    @GetMapping("/me")
    public UserResponse me() { return auth.me(); }
}
