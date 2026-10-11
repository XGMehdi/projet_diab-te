package com.diabeterisk.backend.model;

import com.diabeterisk.backend.model.enums.RiskLevel;
import com.diabeterisk.backend.model.enums.Sex;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * =========================
     * RELATION
     * =========================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /*
     * =========================
     * BRFSS FEATURES
     * =========================
     */

    @Column(name = "high_bp", nullable = false)
    private Boolean highBp;

    @Column(name = "high_chol", nullable = false)
    private Boolean highChol;

    @Column(name = "chol_check", nullable = false)
    private Boolean cholCheck;

    @Column(nullable = false)
    private Double bmi;

    @Column(nullable = false)
    private Boolean smoker;

    @Column(nullable = false)
    private Boolean stroke;

    @Column(name = "heart_disease_or_attack", nullable = false)
    private Boolean heartDiseaseOrAttack;

    @Column(name = "phys_activity", nullable = false)
    private Boolean physActivity;

    @Column(nullable = false)
    private Boolean fruits;

    @Column(nullable = false)
    private Boolean veggies;

    @Column(name = "hvy_alcohol_consump", nullable = false)
    private Boolean hvyAlcoholConsump;

    /*
     * =========================
     * GENERAL HEALTH
     * =========================
     */

    @Column(name = "gen_hlth", nullable = false)
    private Integer genHlth;

    @Column(name = "ment_hlth", nullable = false)
    private Integer mentHlth;

    @Column(name = "phys_hlth", nullable = false)
    private Integer physHlth;

    @Column(name = "diff_walk", nullable = false)
    private Boolean diffWalk;

    /*
     * =========================
     * DEMOGRAPHIC
     * =========================
     */

    @Enumerated(EnumType.STRING)
    private Sex sex;
    @Column(nullable = false)
    private Integer age;

    /*
     * =========================
     * RESULT
     * =========================
     */

    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "shap_values", columnDefinition = "TEXT")
    private String shapValues;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}