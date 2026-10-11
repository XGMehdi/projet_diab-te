package com.diabeterisk.backend.service;

import com.diabeterisk.backend.dto.dashboard.*;
import com.diabeterisk.backend.model.Prediction;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.repository.PredictionRepository;
import com.diabeterisk.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PredictionRepository predictionRepository;

    private final UserRepository userRepository;

    /*
     * =========================
     * GET CURRENT USER
     * =========================
     */

    private User getCurrentUser(
            Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow();
    }

    /*
     * =========================
     * LATEST RISK
     * =========================
     */

    public LatestRiskResponse getLatestRisk(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        Prediction prediction = predictionRepository
                .findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow();

        return new LatestRiskResponse(

                (int) (prediction.getRiskScore() * 100),

                prediction.getRiskLevel());
    }

    /*
     * =========================
     * TOTAL PREDICTIONS
     * =========================
     */

    public TotalPredictionsResponse getTotalPredictions(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        long total = predictionRepository.countByUser(user);

        return new TotalPredictionsResponse(total);
    }

    /*
     * =========================
     * AVERAGE RISK
     * =========================
     */

    public AverageRiskResponse getAverageRisk(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        List<Prediction> predictions = predictionRepository
                .findByUserOrderByCreatedAtDesc(user);

        if (predictions.isEmpty()) {

            return new AverageRiskResponse(
                    0,
                    "Aucune donnée");
        }

        double average = predictions.stream()
                .mapToDouble(
                        Prediction::getRiskScore)
                .average()
                .orElse(0);

        int averagePercent = (int) (average * 100);

        String globalStatus;

        if (averagePercent < 30) {

            globalStatus = "Faible risque";

        } else if (averagePercent < 60) {

            globalStatus = "À surveiller";

        } else {

            globalStatus = "Risque élevé";
        }

        return new AverageRiskResponse(

                averagePercent,

                globalStatus);
    }

    /*
     * =========================
     * RISK CHART
     * =========================
     */

    public List<RiskChartItemResponse> getRiskChart(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        return predictionRepository
                .findTop6ByUserOrderByCreatedAtDesc(user)
                .stream()

                // IMPORTANT:
                // reverse order for chart
                .sorted((a, b) -> a.getCreatedAt()
                        .compareTo(
                                b.getCreatedAt()))

                .map(prediction ->

                new RiskChartItemResponse(

                        prediction.getCreatedAt()
                                .toLocalDate(),

                        (int) (prediction.getRiskScore()
                                * 100)))

                .toList();
    }
}