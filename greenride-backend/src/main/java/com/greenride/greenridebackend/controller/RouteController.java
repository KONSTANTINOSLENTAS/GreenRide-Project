package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.dto.RouteRequest;
import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.BookingRepository;
import com.greenride.greenridebackend.repository.RouteRepository;
import com.greenride.greenridebackend.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteController {

    private final RouteService routeService;
    private final RouteRepository routeRepository;
    private final BookingRepository bookingRepository;

    public RouteController(RouteService routeService,
                           RouteRepository routeRepository,
                           BookingRepository bookingRepository) {
        this.routeService = routeService;
        this.routeRepository = routeRepository;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<Route> createRoute(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.createRoute(request));
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes(@RequestParam(required = false) String destination) {
        return ResponseEntity.ok(routeService.getAllRoutes(destination));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    @GetMapping("/{id}/map")
    public ResponseEntity<Map<String, Object>> getRouteMap(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRouteMap(id));
    }

    @GetMapping("/{id}/passengers")
    public ResponseEntity<List<Map<String, Object>>> getPassengers(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getPassengers(id));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<?> bookSeat(@PathVariable Long id) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            routeService.bookSeat(id, currentUsername);
            return ResponseEntity.ok("Seat booked successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/booked")
    public ResponseEntity<List<Long>> getBookedRoutes() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(routeService.getBookedRouteIds(username));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startRide(@PathVariable Long id) {
        return routeService.updateRideStatus(id, "IN_PROGRESS");
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<?> finishRide(@PathVariable Long id) {
        return routeService.updateRideStatus(id, "COMPLETED");
    }


    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRoute(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Map<String, Object> result = routeService.cancelRoute(id, username);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

// PASSENGER CANCELLATION ENDPOINT
    @PostMapping("/{id}/cancel-booking")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Map<String, Object> result = routeService.cancelBooking(id, username);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}