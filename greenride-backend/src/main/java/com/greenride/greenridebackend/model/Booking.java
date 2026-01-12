package com.greenride.greenridebackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "bookings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "route_id"}) // Prevents duplicate bookings in SQL
})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties
    private User user;

    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    @JsonIgnoreProperties
    private Route route;

    private LocalDateTime bookingTime;

    public Booking() {}

    public Booking(User user, Route route) {
        this.user = user;
        this.route = route;
        this.bookingTime = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public Route getRoute() { return route; }
    public LocalDateTime getBookingTime() { return bookingTime; }
}