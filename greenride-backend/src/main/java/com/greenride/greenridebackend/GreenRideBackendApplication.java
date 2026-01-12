package com.greenride.greenridebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GreenRideBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GreenRideBackendApplication.class, args);
    }

}