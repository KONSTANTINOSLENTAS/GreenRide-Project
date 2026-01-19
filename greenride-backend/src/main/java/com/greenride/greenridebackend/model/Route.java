package com.greenride.greenridebackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: Many routes belong to One driver
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false)
    private String startLocation;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private Double costPerSeat;

    // Optional: Estimated duration from the external map service
    private String estimatedDuration;

    // --- NEW: Vehicle Details ---
    private String vehicleBrand;
    private String vehicleModel;
    // ----------------------------

    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED

    private LocalDateTime actualArrivalTime; // To calculate delays
    private Double durationMin; // Add this field
    private LocalDateTime actualDepartureTime; // NEW FIELD

    // --- NEW FIELD FOR STATS ---
    private Double distanceKm;
    // ---------------------------

    // --- Constructors ---

    public Route() {
    }

    public Route(User driver, String startLocation, String destination, LocalDateTime departureTime, Integer availableSeats, Double costPerSeat) {
        this.driver = driver;
        this.startLocation = startLocation;
        this.destination = destination;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.costPerSeat = costPerSeat;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public String getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(String startLocation) {
        this.startLocation = startLocation;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public Double getCostPerSeat() {
        return costPerSeat;
    }

    public void setCostPerSeat(Double costPerSeat) {
        this.costPerSeat = costPerSeat;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Double getDurationMin() { return durationMin; }
    public void setDurationMin(Double durationMin) { this.durationMin = durationMin; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getActualArrivalTime() { return actualArrivalTime; }
    public void setActualArrivalTime(LocalDateTime actualArrivalTime) { this.actualArrivalTime = actualArrivalTime; }

    public LocalDateTime getActualDepartureTime() { return actualDepartureTime; }
    public void setActualDepartureTime(LocalDateTime actualDepartureTime) { this.actualDepartureTime = actualDepartureTime; }

    public String getVehicleBrand() { return vehicleBrand; }
    public void setVehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    // --- NEW Getter & Setter for Distance ---
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}