package com.greenride.greenridebackend.service;

import com.greenride.greenridebackend.dto.LoginRequest;
import com.greenride.greenridebackend.dto.RegisterRequest;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.model.Role;
import com.greenride.greenridebackend.repository.UserRepository;
import com.greenride.greenridebackend.security.JwtUtil;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    // CHANGE Removed "implements UserDetailsService" to avoid conflict

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final CustomUserDetailsService userDetailsService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // We don't need it here because CustomUserDetailsService handles it now.

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken.");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setRole(Role.USER); // Default role
        newUser.setRating(0.0);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(newUser);
    }

    public String login(LoginRequest request) {
        //  Validate credentials
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOptional.get().getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        //  Generate Token using the UserDetails object
        return jwtUtil.generateToken(userDetails);
    }
}