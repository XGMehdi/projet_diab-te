package com.diabeterisk.backend.service;

import com.diabeterisk.backend.dto.admin.*;
import com.diabeterisk.backend.model.Prediction;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.model.enums.RiskLevel;
import com.diabeterisk.backend.model.enums.Role;
import com.diabeterisk.backend.repository.PredictionRepository;
import com.diabeterisk.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    private final PredictionRepository predictionRepository;

    /*
     * =========================
     * VERIFY ADMIN ACCESS
     * =========================
     */

    private User getAdminUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé"));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Accès réservé aux administrateurs");
        }

        return user;
    }

    /*
     * =========================
     * GET ALL USERS
     * =========================
     */

    public List<AdminUserResponse> getAllUsers(Authentication authentication) {

        getAdminUser(authentication);

        return userRepository.findAll().stream()
                .map(user -> {
                    long totalPreds = predictionRepository.countByUser(user);

                    Prediction latest = predictionRepository
                            .findTopByUserOrderByCreatedAtDesc(user)
                            .orElse(null);

                    return new AdminUserResponse(
                            user.getId(),
                            user.getNom(),
                            user.getPrenom(),
                            user.getEmail(),
                            user.getDateNaissance(),
                            user.getRole().name(),
                            user.getCreatedAt(),
                            totalPreds,
                            latest != null ? latest.getRiskScore() : null,
                            latest != null ? latest.getRiskLevel().name() : null
                    );
                })
                .toList();
    }

    /*
     * =========================
     * DELETE USER
     * =========================
     */

    public void deleteUser(Long userId, Authentication authentication) {

        getAdminUser(authentication);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        // Prevent deleting admin users
        if (targetUser.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Impossible de supprimer un administrateur");
        }

        // Delete all predictions first
        List<Prediction> predictions = predictionRepository
                .findByUserOrderByCreatedAtDesc(targetUser);
        predictionRepository.deleteAll(predictions);

        userRepository.delete(targetUser);
    }

    /*
     * =========================
     * GET USER PREDICTIONS
     * =========================
     */

    public List<AdminPredictionResponse> getUserPredictions(
            Long userId,
            Authentication authentication) {

        getAdminUser(authentication);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        return predictionRepository
                .findByUserOrderByCreatedAtDesc(targetUser)
                .stream()
                .map(p -> new AdminPredictionResponse(
                        p.getId(),
                        targetUser.getId(),
                        targetUser.getNom(),
                        targetUser.getPrenom(),
                        targetUser.getEmail(),
                        p.getRiskScore(),
                        p.getRiskLevel(),
                        p.getShapValues(),
                        p.getCreatedAt(),
                        p.getHighBp(),
                        p.getHighChol(),
                        p.getCholCheck(),
                        p.getBmi(),
                        p.getSmoker(),
                        p.getStroke(),
                        p.getHeartDiseaseOrAttack(),
                        p.getPhysActivity(),
                        p.getFruits(),
                        p.getVeggies(),
                        p.getHvyAlcoholConsump(),
                        p.getGenHlth(),
                        p.getMentHlth(),
                        p.getPhysHlth(),
                        p.getDiffWalk(),
                        p.getSex(),
                        p.getAge()
                ))
                .toList();
    }

    /*
     * =========================
     * GET ADMIN STATISTICS
     * =========================
     */

    public AdminStatsResponse getStats(Authentication authentication) {

        getAdminUser(authentication);

        long totalUsers = userRepository.count();
        long totalPredictions = predictionRepository.count();

        long highRisk = predictionRepository.countByRiskLevel(RiskLevel.HIGH);
        long moderateRisk = predictionRepository.countByRiskLevel(RiskLevel.MODERATE);
        long lowRisk = predictionRepository.countByRiskLevel(RiskLevel.LOW);

        double avgRisk = 0.0;
        if (totalPredictions > 0) {
            avgRisk = predictionRepository.findAll().stream()
                    .mapToDouble(Prediction::getRiskScore)
                    .average()
                    .orElse(0.0);
        }

        // Get first day of current month
        LocalDateTime startOfMonth = LocalDateTime.now()
                .with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long predictionsThisMonth = predictionRepository.countByCreatedAtAfter(startOfMonth);

        return new AdminStatsResponse(
                totalUsers,
                totalPredictions,
                highRisk,
                moderateRisk,
                lowRisk,
                Math.round(avgRisk * 100.0) / 100.0,
                newUsersThisMonth,
                predictionsThisMonth
        );
    }
}
