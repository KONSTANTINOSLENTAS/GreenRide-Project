package com.greenride.greenridebackend.service;

import com.greenride.greenridebackend.model.Booking;
import com.greenride.greenridebackend.model.Notification;
import com.greenride.greenridebackend.model.Route;
import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.BookingRepository;
import com.greenride.greenridebackend.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BookingRepository bookingRepository;

    public NotificationService(NotificationRepository notificationRepository, BookingRepository bookingRepository) {
        this.notificationRepository = notificationRepository;
        this.bookingRepository = bookingRepository;
    }

    public void createNotification(User recipient, String message, String type) {
        notificationRepository.save(new Notification(recipient, message, type));
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    // Runs every minute to check if any rides start in 30 mins
    @Scheduled(fixedRate = 60000)
    public void checkUpcomingRides() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusMinutes(30);

        List<Booking> bookings = bookingRepository.findAll();

        for (Booking booking : bookings) {
            LocalDateTime departure = booking.getRoute().getDepartureTime();

            // If departure is between NOW and NOW+30min
            if (departure.isAfter(now) && departure.isBefore(threshold)) {

                String msg = "Your ride to " + booking.getRoute().getDestination() + " starts soon!";

                // FIX: Check if we already sent this specific message to avoid spamming every minute
                boolean alreadySent = getUserNotifications(booking.getUser()).stream()
                        .anyMatch(n -> n.getMessage().equals(msg));

                if (!alreadySent) {
                    createNotification(booking.getUser(), msg, "REMINDER");

                }
            }
        }
    }
}