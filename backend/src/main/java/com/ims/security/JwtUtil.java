package com.ims.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.security.SecureRandom;

@Slf4j
@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret:}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs,
                   @Value("${spring.profiles.active:}") String activeProfiles) {
        if (secret == null || secret.isBlank()) {
            if (java.util.Arrays.stream(activeProfiles.split(",")).anyMatch("prod"::equalsIgnoreCase)) {
                throw new IllegalArgumentException("JWT_SECRET must be configured when the prod profile is active");
            }
            byte[] keyBytes = new byte[32];
            new SecureRandom().nextBytes(keyBytes);
            secret = java.util.Base64.getEncoder().encodeToString(keyBytes);
            log.warn("JWT_SECRET is unset; using an ephemeral development key. Existing tokens expire when the server restarts.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must contain at least 32 bytes of random key material");
        }
        if (expirationMs < 60_000) throw new IllegalArgumentException("JWT_EXPIRATION_MS must be at least 60000");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generate(String email, String role) {
        Date now = new Date();
        return Jwts.builder().subject(email).claim("role", role).issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
