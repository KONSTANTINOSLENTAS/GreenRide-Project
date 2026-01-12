package com.greenride.greenridebackend.repository;

import com.greenride.greenridebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository<Entity, ID Type> gives us methods like save(), findAll(), findById() automatically.
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA automatically generates the SQL for this method based on the name

    Optional<User> findByUsername(String username);

    // Check if a username or email already exists
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}