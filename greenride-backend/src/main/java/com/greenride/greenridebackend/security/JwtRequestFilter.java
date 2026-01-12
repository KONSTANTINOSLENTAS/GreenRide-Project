package com.greenride.greenridebackend.security;

import com.greenride.greenridebackend.service.UserService;
import com.greenride.greenridebackend.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    // CHANGE 1: Use CustomUserDetailsService instead of UserService
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        // --- DEBUG LOGS START ---
        System.out.println("------------------------------------------------");
        System.out.println("Incoming Request: " + request.getMethod() + " " + request.getRequestURI());

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            System.out.println("Token found: " + jwt.substring(0, 10) + "..."); // Print first 10 chars
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("Username from Token: " + username);
            } catch (Exception e) {
                System.out.println("!!! ERROR extracting username: " + e.getMessage());
                e.printStackTrace(); // Print full error to see if it's Signature or Expiration
            }
        } else {
            System.out.println("Warning: Authorization header is missing or does not start with 'Bearer '");
            System.out.println("Header value: " + authorizationHeader);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Checking database for user: " + username);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            boolean isValid = false;
            try {
                isValid = jwtUtil.validateToken(jwt, userDetails.getUsername());
            } catch (Exception e) {
                System.out.println("!! Token Validation Error: " + e.getMessage());
            }

            if (isValid) {
                System.out.println("Token is VALID. Logging user in.");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("!!! Token is INVALID according to JwtUtil.");
            }
        }
        System.out.println("------------------------------------------------");
        // --- DEBUG LOGS END ---

        chain.doFilter(request, response);
    }
}