package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.model.Booking;
import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.BookingRepository;
import com.greenride.greenridebackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Import this
import com.greenride.greenridebackend.model.Review; // Import
import com.greenride.greenridebackend.repository.ReviewRepository;
import com.greenride.greenridebackend.repository.RouteRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // <--- THIS FIXES THE NETWORK ERROR
public class UserController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final RouteRepository routeRepository;

    public UserController(UserRepository userRepository, BookingRepository bookingRepository, ReviewRepository reviewRepository, RouteRepository routeRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.routeRepository = routeRepository;
    }

    // 1. Get My Profie Info
    @GetMapping("/me")
    public Map<String, Object> getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("role", user.getRole());

        // Check if rating is null (which it is for the Admin) and default to 0.0
        response.put("rating", user.getRating() != null ? user.getRating() : 0.0);

        return response;
    }
    // 2. Get My Rides (As Passenger AND Driver)
    @GetMapping("/me/rides")
    public ResponseEntity<List<Route>> getMyRides(@RequestParam(required = false) String type) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch ALL relevant rides (Passenger bookings + Driver routes)
        List<Route> passengerRoutes = bookingRepository.findAllByUser(user).stream()
                .map(Booking::getRoute)
                .collect(Collectors.toList());

        List<Route> driverRoutes = routeRepository.findByDriver(user);

        passengerRoutes.addAll(driverRoutes);

        // Remove duplicates (in case I booked my own ride somehow)
        List<Route> distinctRoutes = passengerRoutes.stream().distinct().collect(Collectors.toList());

        // FILTERING LOGIC
        List<Route> filteredRoutes;

        if ("history".equals(type)) {
            // History = Rides that are explicitly COMPLETED
            filteredRoutes = distinctRoutes.stream()
                    .filter(r -> "COMPLETED".equals(r.getStatus()))
                    .collect(Collectors.toList());
        } else {
            // Upcoming = SCHEDULED or IN_PROGRESS
            filteredRoutes = distinctRoutes.stream()
                    .filter(r -> !"COMPLETED".equals(r.getStatus()))
                    .collect(Collectors.toList());
        }

        // Sort: Upcoming by nearest date, History by most recent
        if ("history".equals(type)) {
            filteredRoutes.sort((r1, r2) -> r2.getDepartureTime().compareTo(r1.getDepartureTime())); // Descending
        } else {
            filteredRoutes.sort((r1, r2) -> r1.getDepartureTime().compareTo(r2.getDepartureTime())); // Ascending
        }

        return ResponseEntity.ok(filteredRoutes);
    }

    // 3. Get Reviews

    @GetMapping("/me/reviews")
    public ResponseEntity<List<Map<String, Object>>> getMyReviews() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Review> reviews = reviewRepository.findByTarget(user);

        List<Map<String, Object>> response = reviews.stream().map(review -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("author", review.getAuthor().getUsername());
            map.put("rating", review.getRating());
            map.put("comment", review.getComment());
            map.put("date", review.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null); // Changed to use orElse(null)

        if (user == null) {
            System.err.println("❌ USER NOT FOUND: Requested ID " + id + " does not exist.");
            return ResponseEntity.status(404).body("User not found for ID: " + id);
        }

        // Return public info
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "rating", user.getRating(),
                "role", user.getRole(),
                "joinedAt", "2023" // Placeholder
        ));
    }


    // Get Reviews for specific user
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Map<String, Object>>> getUserReviews(@PathVariable Long id) {
        User target = userRepository.findById(id).orElse(null);

        if (target == null) {
            // handle the case where the user doesn't exist
            return ResponseEntity.status(404).build();
        }

        List<Review> reviews = reviewRepository.findByTarget(target);

        List<Map<String, Object>> response = reviews.stream().map(review -> {
            Map<String, Object> map = new HashMap<>();
            map.put("author", review.getAuthor().getUsername());
            map.put("rating", review.getRating());
            map.put("comment", review.getComment());
            map.put("date", review.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

}