package com.diabeterisk.backend.controller;

import com.diabeterisk.backend.dto.auth.*;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.repository.UserRepository;
import com.diabeterisk.backend.service.AuthService;
import com.diabeterisk.backend.service.PasswordResetService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

        private final AuthService authService;

        private final UserRepository userRepository;

        private final PasswordResetService passwordResetService;

        @PostMapping("/register")
        public void register(
                        @Valid @RequestBody RegisterRequest request) {

                authService.register(request);
        }

        @PostMapping("/login")
        public AuthResponse login(
                        @Valid @RequestBody LoginRequest request) {

                return authService.login(request);
        }

        @GetMapping("/me")
        public UserResponse me(
                        Authentication authentication) {

                String email = authentication.getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow();

                return new UserResponse(
                                user.getId(),
                                user.getNom(),
                                user.getPrenom(),
                                user.getEmail(),
                                user.getDateNaissance(),
                                user.getRole().name());
        }

        /*
         * =========================
         * FORGOT PASSWORD
         * =========================
         */
        @PostMapping("/forgot-password")
        public ResponseEntity<Map<String, String>> forgotPassword(
                        @Valid @RequestBody ForgotPasswordRequest request) {

                try {
                        passwordResetService.forgotPassword(request.email());
                        return ResponseEntity.ok(Map.of(
                                        "message", "Un email de réinitialisation a été envoyé."));
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "message", e.getMessage()));
                }
        }

        /*
         * =========================
         * RESET PASSWORD
         * =========================
         */
        @PostMapping("/reset-password")
        public ResponseEntity<Map<String, String>> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {

                try {
                        passwordResetService.resetPassword(request.token(), request.newPassword());
                        return ResponseEntity.ok(Map.of(
                                        "message", "Votre mot de passe a été réinitialisé avec succès."));
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "message", e.getMessage()));
                }
        }
}
