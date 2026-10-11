package com.diabeterisk.backend.dto.prediction;

import com.diabeterisk.backend.model.enums.RiskLevel;
import lombok.Data;

@Data
public class FastApiResponse {
    private Double riskScore;
    private RiskLevel riskLevel;
    private String shapValuesAsJsonString;
}
