package com.greenride.greenridebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; 
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user writing the review
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnoreProperties({"password", "routes", "reviews", "bookings"}) 
    private User author;

    // The user RECEIVING the review (the driver or passenger being rated)
    @ManyToOne
    @JoinColumn(name = "target_id", nullable = false)
    @JsonIgnoreProperties({"password", "routes", "reviews", "bookings"}) 
    private User target;

    private Integer rating; // 1 to 5
    private String comment;
    private LocalDateTime createdAt;

    public Review() {}

    public Review(User author, User target, Integer rating, String comment) {
        this.author = author;
        this.target = target;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public User getAuthor() { return author; }
    public User getTarget() { return target; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }

}