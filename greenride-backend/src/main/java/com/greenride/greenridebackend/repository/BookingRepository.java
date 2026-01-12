package com.greenride.greenridebackend.repository;

import com.greenride.greenridebackend.model.Booking;
import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByUserAndRoute(User user, Route route);
    List<Booking> findAllByUser(User user);
    List<Booking> findAllByRoute(Route route);



    // Find rides where the route departure is AFTER now (Upcoming)
    List<Booking> findAllByUserAndRouteDepartureTimeAfter(User user, LocalDateTime now);

    // Find rides where the route departure is BEFORE now (History)
    List<Booking> findAllByUserAndRouteDepartureTimeBefore(User user, LocalDateTime now);

    Optional<Booking> findByUserAndRoute(User user, Route route);

}