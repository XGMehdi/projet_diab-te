package com.diabeterisk.backend.controller;

import com.diabeterisk.backend.dto.dashboard.*;
import com.diabeterisk.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor

public class DashboardController {

    private final DashboardService dashboardService;

    /*
     * =========================
     * LATEST RISK
     * =========================
     */

    @GetMapping("/latest-risk")
    public LatestRiskResponse getLatestRisk(
            Authentication authentication) {

        return dashboardService
                .getLatestRisk(authentication);
    }

    /*
     * =========================
     * TOTAL PREDICTIONS
     * =========================
     */

    @GetMapping("/total-predictions")
    public TotalPredictionsResponse getTotalPredictions(
            Authentication authentication) {

        return dashboardService
                .getTotalPredictions(authentication);
    }

    /*
     * =========================
     * AVERAGE RISK
     * =========================
     */

    @GetMapping("/average-risk")
    public AverageRiskResponse getAverageRisk(
            Authentication authentication) {

        return dashboardService
                .getAverageRisk(authentication);
    }

    /*
     * =========================
     * RISK CHART
     * =========================
     */

    @GetMapping("/risk-chart")
    public List<RiskChartItemResponse> getRiskChart(
            Authentication authentication) {

        return dashboardService
                .getRiskChart(authentication);
    }
}