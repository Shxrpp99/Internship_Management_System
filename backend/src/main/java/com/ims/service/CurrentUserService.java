package com.ims.service;

import com.ims.entity.User;
import com.ims.exception.ApiException;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository users;

    public User get() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        return users.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
