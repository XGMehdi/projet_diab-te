package com.diabeterisk.backend.dto.dashboard;

import java.time.LocalDate;

public record RiskChartItemResponse(

        LocalDate date,

        Integer riskScore

) {
}