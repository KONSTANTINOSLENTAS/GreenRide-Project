package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final RouteService routeService;

    public AdminController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')") // Ensure only Admin can access
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(routeService.getAdminStats());
    }
}