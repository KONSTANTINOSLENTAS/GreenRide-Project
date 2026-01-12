package com.greenride.greenridebackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient; // Who gets the message

    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String type;

    public Notification() {}
    public Notification(User recipient, String message, String type) {
        this.recipient = recipient;
        this.message = message;
        this.type = type;
    }

    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public String getMessage() { return message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getType() { return type; }
}