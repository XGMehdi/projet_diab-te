package com.diabeterisk.backend.dto.dashboard;

import com.diabeterisk.backend.model.enums.RiskLevel;

public record LatestRiskResponse(

        Integer riskScore,

        RiskLevel riskLevel

) {
}