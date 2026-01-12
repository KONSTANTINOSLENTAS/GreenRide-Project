package com.greenride.greenridebackend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class RouteRequest {

    @NotBlank(message = "Start location is required")
    private String startLocation;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @NotNull(message = "Available seats are required")
    @Min(value = 1, message = "There must be at least 1 seat available")
    private Integer availableSeats;

    @NotNull(message = "Cost per seat is required")
    @Min(value = 0, message = "Cost cannot be negative")
    private Double costPerSeat;

    @NotBlank(message = "Vehicle brand is required")
    private String vehicleBrand;

    @NotBlank(message = "Vehicle model is required")
    private String vehicleModel;


    public RouteRequest() {}

    public RouteRequest(String startLocation, String destination, LocalDateTime departureTime, Integer availableSeats, Double costPerSeat, String vehicleBrand, String vehicleModel) {
        this.startLocation = startLocation;
        this.destination = destination;
        this.departureTime = departureTime;
        this.availableSeats = availableSeats;
        this.costPerSeat = costPerSeat;
        this.vehicleBrand = vehicleBrand;
        this.vehicleModel = vehicleModel;
    }

    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public Double getCostPerSeat() { return costPerSeat; }
    public void setCostPerSeat(Double costPerSeat) { this.costPerSeat = costPerSeat; }

    public String getVehicleBrand() { return vehicleBrand; }
    public void setVehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    private Double durationMin;
    public Double getDurationMin() { return durationMin; }
    public void setDurationMin(Double durationMin) { this.durationMin = durationMin; }
}