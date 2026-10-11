package com.diabeterisk.backend.dto.admin;

public record AdminStatsResponse(

        long totalUsers,

        long totalPredictions,

        long highRiskCount,

        long moderateRiskCount,

        long lowRiskCount,

        double averageRiskScore,

        long newUsersThisMonth,

        long predictionsThisMonth

) {
}
