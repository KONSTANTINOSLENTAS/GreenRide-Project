package com.greenride.greenridebackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenride.greenridebackend.dto.RouteRequest;
import com.greenride.greenridebackend.integration.OpenRouteService; // Imported the Specialist
import com.greenride.greenridebackend.model.Booking;
import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.BookingRepository;
import com.greenride.greenridebackend.repository.RouteRepository;
import com.greenride.greenridebackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final OpenRouteService openRouteService; // INJECTED SPECIALIST

    // Kept because getWeather() still needs them locally
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RouteService(RouteRepository routeRepository,
                        UserRepository userRepository,
                        BookingRepository bookingRepository,
                        NotificationService notificationService,
                        OpenRouteService openRouteService) { // Added to constructor
        this.routeRepository = routeRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.openRouteService = openRouteService;
    }

    public List<Route> getAllRoutes(String destination) {
        if (destination != null && !destination.isEmpty()) {
            return routeRepository.findByDestinationContainingIgnoreCase(destination);
        }
        return routeRepository.findAll();
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));
    }

    public Route createRoute(RouteRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User driver = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Driver not found"));

        Route route = new Route();
        route.setStartLocation(request.getStartLocation());
        route.setDestination(request.getDestination());
        route.setDepartureTime(request.getDepartureTime());
        route.setAvailableSeats(request.getAvailableSeats());
        route.setCostPerSeat(request.getCostPerSeat());
        route.setVehicleBrand(request.getVehicleBrand());
        route.setVehicleModel(request.getVehicleModel());
        route.setDriver(driver);
        route.setStatus("SCHEDULED");

        // Use the new simplified method
        calculateRouteMetrics(route);

        return routeRepository.save(route);
    }

    // --- REFACTORED: Now uses OpenRouteService ---
    private void calculateRouteMetrics(Route route) {
        try {
            // Ask the specialist for details
            Map<String, Object> details = openRouteService.getRouteDetails(route.getStartLocation(), route.getDestination());

            if (details != null) {
                // Extract clean data from the specialist's response
                Double distanceKm = (Double) details.get("distanceKm");
                Double durationMin = (Double) details.get("durationMin");

                route.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
                route.setDurationMin(durationMin);
            } else {
                // Fallback
                route.setDistanceKm(0.0);
                route.setDurationMin(60.0);
            }
        } catch (Exception e) {
            System.err.println("Failed to calculate initial metrics: " + e.getMessage());
            route.setDistanceKm(0.0);
            route.setDurationMin(60.0);
        }
    }

    @Transactional
    public void bookSeat(Long routeId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Route route = routeRepository.findById(routeId).orElseThrow(() -> new RuntimeException("Route not found"));

        if (route.getAvailableSeats() <= 0) throw new RuntimeException("No seats available");
        if (bookingRepository.existsByUserAndRoute(user, route)) throw new RuntimeException("Already booked");
        if (route.getDriver().getId().equals(user.getId())) throw new RuntimeException("Cannot book your own ride");

        Booking booking = new Booking(user, route);
        bookingRepository.save(booking);
        route.setAvailableSeats(route.getAvailableSeats() - 1);
        routeRepository.save(route);

        notificationService.createNotification(route.getDriver(), user.getUsername() + " joined your ride", "BOOKING");
        notificationService.createNotification(user, "Booking confirmed!", "CONFIRMATION");
    }

    public List<Long> getBookedRouteIds(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findAllByUser(user).stream().map(b -> b.getRoute().getId()).collect(Collectors.toList());
    }

    public ResponseEntity<?> updateRideStatus(Long id, String newStatus) {
        Route route = routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));
        route.setStatus(newStatus);
        if ("IN_PROGRESS".equals(newStatus)) route.setActualDepartureTime(LocalDateTime.now());
        if ("COMPLETED".equals(newStatus)) route.setActualArrivalTime(LocalDateTime.now());
        routeRepository.save(route);
        return ResponseEntity.ok("Ride status updated to " + newStatus);
    }

    public List<Map<String, Object>> getPassengers(Long id) {
        if (!routeRepository.existsById(id)) throw new RuntimeException("Route not found");
        return bookingRepository.findAll().stream()
                .filter(b -> b.getRoute().getId().equals(id))
                .map(b -> {
                    User u = b.getUser();
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("rating", u.getRating());
                    return map;
                })
                .collect(Collectors.toList());
    }

    // --- REFACTORED: Now uses OpenRouteService ---
    public Map<String, Object> getRouteMap(Long id) {
        Route route = getRouteById(id);

        try {
            // 1. Get Geometry & Stats from Specialist
            Map<String, Object> routeDetails = openRouteService.getRouteDetails(route.getStartLocation(), route.getDestination());

            // 2. Fallback if specialist fails
            if (routeDetails == null) {
                return Map.of("geometry", List.of(), "distanceKm", 0, "durationMin", 60, "weather", Map.of("temp", 0, "code", -1));
            }

            Double distanceKm = (Double) routeDetails.get("distanceKm");
            Double durationMin = (Double) routeDetails.get("durationMin");
            List<?> geometry = (List<?>) routeDetails.get("geometry");

            // 3. Update DB if values are missing or better (Preserving your original logic)
            boolean needsSave = false;
            if (route.getDistanceKm() == null || Math.abs(route.getDistanceKm() - distanceKm) > 0.1) {
                route.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
                needsSave = true;
            }
            if (route.getDurationMin() == null || Math.abs(route.getDurationMin() - durationMin) > 1.0) {
                route.setDurationMin(durationMin);
                needsSave = true;
            }
            if (needsSave) routeRepository.save(route);

            // 4. Get Coordinates for Weather (Since OpenRouteService abstraction hides raw coords,
            //    we can extract the destination coordinates from the LAST point of the geometry list)
            double endLat = 0;
            double endLon = 0;
            if (geometry != null && !geometry.isEmpty()) {
                List<Double> lastPoint = (List<Double>) geometry.get(geometry.size() - 1);
                // Leaflet coords are [Lat, Lon] based on your OpenRouteService implementation
                endLat = lastPoint.get(0);
                endLon = lastPoint.get(1);
            }

            // 5. Get Weather (Using local private method)
            Map<String, Object> weatherData = getWeather(endLat, endLon);

            return Map.of(
                    "geometry", geometry,
                    "distanceKm", route.getDistanceKm(),
                    "durationMin", durationMin,
                    "weather", weatherData
            );
        } catch (Exception e) {
            return Map.of("geometry", List.of(), "distanceKm", 0, "durationMin", 60, "weather", Map.of("temp", 0, "code", -1));
        }
    }

    public Map<String, Object> getAdminStats() {
        List<Route> allRoutes = routeRepository.findAll();
        long totalRides = allRoutes.size();

        double avgLength = allRoutes.stream()
                .filter(r -> r.getDistanceKm() != null && r.getDistanceKm() > 0)
                .mapToDouble(Route::getDistanceKm)
                .average()
                .orElse(0.0);

        double avgSeats = allRoutes.stream()
                .mapToInt(Route::getAvailableSeats)
                .average()
                .orElse(0.0);

        String popularDest = allRoutes.stream()
                .collect(Collectors.groupingBy(Route::getDestination, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        return Map.of(
                "totalRides", totalRides,
                "avgLength", Math.round(avgLength * 10.0) / 10.0,
                "avgSeats", Math.round(avgSeats * 10.0) / 10.0,
                "popularDest", popularDest
        );
    }

    //  OpenRouteService doesn't handle Weather
    private Map<String, Object> getWeather(double lat, double lon) {
        try {
            String url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode current = root.path("current");
            double temp = current.path("temperature_2m").asDouble();
            int code = current.path("weather_code").asInt();

            return Map.of("temp", temp, "code", code);
        } catch (Exception e) {
            return Map.of("temp", 0, "code", -1);
        }
    }


    @Transactional
    public Map<String, Object> cancelRoute(Long routeId, String username) {
        Route route = routeRepository.findById(routeId).orElseThrow(() -> new RuntimeException("Route not found"));
        if (!route.getDriver().getUsername().equals(username)) throw new RuntimeException("Only the driver can cancel the route.");

        long minutesUntilDeparture = ChronoUnit.MINUTES.between(LocalDateTime.now(), route.getDepartureTime());
        boolean isLateCancellation = minutesUntilDeparture <= 10 && minutesUntilDeparture > 0;

        if (route.getStatus().equals("IN_PROGRESS") || route.getStatus().equals("COMPLETED")) throw new RuntimeException("Cannot cancel an in-progress or completed ride.");

        List<User> passengersToNotify = bookingRepository.findAllByRoute(route).stream().map(Booking::getUser).collect(Collectors.toList());
        passengersToNotify.forEach(p -> { if (p != null) notificationService.createNotification(p, "The route to " + route.getDestination() + " has been cancelled.", "CANCELLATION"); });

        bookingRepository.findAllByRoute(route).forEach(bookingRepository::delete);
        routeRepository.delete(route);

        return Map.of("success", true, "lateCancellation", isLateCancellation, "message", isLateCancellation ? "Late cancellation. Penalty may apply." : "Route cancelled.");
    }

    @Transactional
    public Map<String, Object> cancelBooking(Long routeId, String username) {
        User passenger = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Passenger not found"));
        Route route = routeRepository.findById(routeId).orElseThrow(() -> new RuntimeException("Route not found"));
        Booking booking = bookingRepository.findByUserAndRoute(passenger, route).orElseThrow(() -> new RuntimeException("Booking not found."));

        long minutesUntilDeparture = ChronoUnit.MINUTES.between(LocalDateTime.now(), route.getDepartureTime());
        boolean isLateCancellation = minutesUntilDeparture <= 10 && minutesUntilDeparture > 0;

        if (route.getStatus().equals("IN_PROGRESS") || route.getStatus().equals("COMPLETED")) throw new RuntimeException("Cannot cancel booking for an active ride.");

        bookingRepository.delete(booking);
        route.setAvailableSeats(route.getAvailableSeats() + 1);
        routeRepository.save(route);

        if (route.getDriver() != null) notificationService.createNotification(route.getDriver(), passenger.getUsername() + " cancelled their booking.", "BOOKING_CHANGE");

        return Map.of("success", true, "isRefunded", !isLateCancellation, "message", isLateCancellation ? "Late cancellation. No refund." : "Booking cancelled. Refund processing.");
    }
}