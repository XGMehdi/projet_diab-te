package com.diabeterisk.backend.dto.prediction;

import com.diabeterisk.backend.model.enums.RiskLevel;

import java.time.LocalDateTime;

public record PredictionSummaryResponse(

        Long id,

        Double riskScore,

        RiskLevel riskLevel,

        LocalDateTime createdAt

) {
}