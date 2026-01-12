package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.model.Review;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.ReviewRepository;
import com.greenride.greenridebackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{routeId}")
    public ResponseEntity<?> addReview(@PathVariable Long routeId, @RequestBody Map<String, Object> payload) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Get Target User ID from Frontend Payload
        if (payload.get("targetId") == null) {
            return ResponseEntity.badRequest().body("Target ID is required");
        }

        Long targetId = Long.valueOf(payload.get("targetId").toString());
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        // 2. Create and Save Review
        Review review = new Review(
                author,
                target,
                (Integer) payload.get("rating"),
                (String) payload.get("comment")
        );

        reviewRepository.save(review);

        // 3. Update Target's Average Rating
        updateUserRating(target);

        return ResponseEntity.ok("Review saved for " + target.getUsername());
    }

    private void updateUserRating(User user) {
        double avg = reviewRepository.findByTarget(user).stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        user.setRating(Math.round(avg * 10.0) / 10.0);
        userRepository.save(user);
    }
}