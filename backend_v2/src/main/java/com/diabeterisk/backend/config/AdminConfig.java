package com.diabeterisk.backend.config;

import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.model.enums.Role;
import com.diabeterisk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class AdminConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String adminEmail = "admin@gmail.com";

        if (!userRepository.existsByEmail(adminEmail)) {

            User admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin"))
                    .nom("System")
                    .prenom("Administrator")
                    .dateNaissance(LocalDate.of(2000, 1, 1))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);

            System.out.println("====================================");
            System.out.println("Default ADMIN created");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: admin");
            System.out.println("====================================");
        }
    }
}