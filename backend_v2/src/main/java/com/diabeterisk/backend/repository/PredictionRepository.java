package com.diabeterisk.backend.repository;

import com.diabeterisk.backend.model.Prediction;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.model.enums.RiskLevel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    List<Prediction> findByUserOrderByCreatedAtDesc(User user);

    Optional<Prediction> findTopByUserOrderByCreatedAtDesc(User user);

    long countByUser(User user);

    List<Prediction> findTop6ByUserOrderByCreatedAtDesc(User user);

    @Query("""
                SELECT p
                FROM Prediction p
                WHERE p.user = :user
                AND DATE(p.createdAt) = :date
            """)
    Optional<Prediction> findByUserAndDate(
            User user,
            LocalDate date);

    /* ===========================
     * ADMIN QUERIES
     * =========================== */

    long countByRiskLevel(RiskLevel riskLevel);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    List<Prediction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Prediction> findAllByOrderByCreatedAtDesc();
}