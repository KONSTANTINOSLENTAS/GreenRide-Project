package com.greenride.greenridebackend.repository;

import com.greenride.greenridebackend.model.Review;
import com.greenride.greenridebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Find all reviews where 'target' is the specific user
    List<Review> findByTarget(User target);
}