package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.dto.LoginRequest;
import com.greenride.greenridebackend.dto.RegisterRequest;
import com.greenride.greenridebackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.login(request);
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @Valid
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Call the service mehtod that accepts the full RegisterRequest
            userService.registerUser(request);
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException e) {
            // error message
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // hhelper class for lgin response
    static class LoginResponse {
        private String token;

        public LoginResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }
}