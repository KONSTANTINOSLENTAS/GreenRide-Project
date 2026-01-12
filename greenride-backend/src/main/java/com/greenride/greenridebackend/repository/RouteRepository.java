package com.greenride.greenridebackend.repository;

import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface RouteRepository extends JpaRepository<Route, Long> {

    // 1. Find all routes created by a specific driver
    List<Route> findByDriver(User driver);

    // "ContainingIgnoreCase" allows partial matches ("athe" finds "Athens")
    List<Route> findByDestinationContainingIgnoreCase(String destination);

    List<Route> findByStartLocationAndDestination(String startLocation, String destination);

    // 4. Find valid future routes (so users don't see trips from yesterday)
    List<Route> findByDepartureTimeAfter(LocalDateTime now);
    List<Route> findByDriverAndDepartureTimeAfter(User driver, LocalDateTime now);
    List<Route> findByDriverAndDepartureTimeBefore(User driver, LocalDateTime now);
}