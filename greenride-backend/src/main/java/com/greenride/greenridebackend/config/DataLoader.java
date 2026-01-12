package com.greenride.greenridebackend.config;

import com.greenride.greenridebackend.model.User;
import com.greenride.greenridebackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.greenride.greenridebackend.model.Role;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
           if (userRepository.count() == 0) {
               User user = new User();
               user.setUsername("User1");
               user.setPassword(passwordEncoder.encode("test"));
               user.setEmail("user1@test.com");
               user.setPhoneNumber("1111111111");
               user.setRating(3.7);
               user.setRole(Role.USER);
               userRepository.save(user);
               System.out.println("Test User (User1) created: username='User1', password='test'");
           }


            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123")); // Login with this password
                admin.setEmail("admin@greenride.com");
                admin.setPhoneNumber("0000000000"); // phone number for validation
                admin.setRole(Role.ADMIN);
                admin.setRating(5.0);
                userRepository.save(admin);
                System.out.println("Admin user created: username='admin', password='admin123'");
            }
        };
    }
}