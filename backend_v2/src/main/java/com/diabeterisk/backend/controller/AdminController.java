package com.diabeterisk.backend.controller;

import com.diabeterisk.backend.dto.admin.*;
import com.diabeterisk.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor

public class AdminController {

    private final AdminService adminService;

    /*
     * =========================
     * GET ALL USERS
     * =========================
     */

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers(
            Authentication authentication) {

        return adminService.getAllUsers(authentication);
    }

    /*
     * =========================
     * DELETE USER
     * =========================
     */

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        adminService.deleteUser(id, authentication);
        return ResponseEntity.ok(Map.of(
                "message", "Utilisateur supprimé avec succès"));
    }

    /*
     * =========================
     * GET USER PREDICTIONS
     * =========================
     */

    @GetMapping("/users/{id}/predictions")
    public List<AdminPredictionResponse> getUserPredictions(
            @PathVariable Long id,
            Authentication authentication) {

        return adminService.getUserPredictions(id, authentication);
    }

    /*
     * =========================
     * STATISTICS
     * =========================
     */

    @GetMapping("/stats")
    public AdminStatsResponse getStats(
            Authentication authentication) {

        return adminService.getStats(authentication);
    }
}
