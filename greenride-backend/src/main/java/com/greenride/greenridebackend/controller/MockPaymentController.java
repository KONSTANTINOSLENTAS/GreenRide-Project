package com.greenride.greenridebackend.controller;

import com.greenride.greenridebackend.dto.PaymentRequest;
import com.greenride.greenridebackend.dto.PaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/external/bank")
@CrossOrigin(origins = "http://localhost:3000") // Allow React to call this
public class MockPaymentController {

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {

        // 1. Simulate Network Delay
        try { Thread.sleep(1500); } catch (InterruptedException e) {}

        System.out.println("BANK: Processing $" + request.getAmount() + " via " + request.getMethod());


        if (request.getAmount() == 999.0) {
            System.out.println(" BANK: Payment Declined (Insufficient Funds)");
            return ResponseEntity.ok(new PaymentResponse("FAILED", null));
        }

        System.out.println(" BANK: Payment Approved!");
        return ResponseEntity.ok(new PaymentResponse("SUCCESS", UUID.randomUUID().toString()));
    }
}