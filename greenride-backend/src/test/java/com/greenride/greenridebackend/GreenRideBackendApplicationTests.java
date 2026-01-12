package com.greenride.greenridebackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles; // Import this

@SpringBootTest
@ActiveProfiles("test") // <-- ADD THIS LINE
class GreenRideBackendApplicationTests {

    @Test
    void contextLoads() {
        // ...
    }
}