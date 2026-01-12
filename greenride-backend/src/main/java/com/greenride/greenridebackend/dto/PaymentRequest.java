package com.greenride.greenridebackend.dto;

public class PaymentRequest {
    private String userId;
    private Double amount;
    private String method; // "visa", "apple_pay", etc.

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}