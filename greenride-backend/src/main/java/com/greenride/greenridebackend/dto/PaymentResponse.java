package com.greenride.greenridebackend.dto;

public class PaymentResponse {
    private String status; // "SUCCESS" or "FAILED"
    private String transactionId;

    public PaymentResponse(String status, String transactionId) {
        this.status = status;
        this.transactionId = transactionId;
    }

    // Getters
    public String getStatus() { return status; }
    public String getTransactionId() { return transactionId; }
}