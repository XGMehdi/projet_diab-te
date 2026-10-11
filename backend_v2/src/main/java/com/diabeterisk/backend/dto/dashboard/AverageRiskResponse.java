package com.diabeterisk.backend.dto.dashboard;

public record AverageRiskResponse(

        Integer averageRiskScore,

        String globalStatus

) {
}