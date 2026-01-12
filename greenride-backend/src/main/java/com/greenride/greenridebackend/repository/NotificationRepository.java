package com.greenride.greenridebackend.repository;

import com.greenride.greenridebackend.model.Notification;
import com.greenride.greenridebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch unread notifications for a specific user, newest first
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}