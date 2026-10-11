package com.diabeterisk.backend.dto.prediction;

import com.diabeterisk.backend.model.enums.RiskLevel;
import com.diabeterisk.backend.model.enums.Sex;
import com.fasterxml.jackson.annotation.JsonRawValue;

import java.time.LocalDateTime;

public record PredictionResponse(

        Long predictionId,

        Double riskScore,

        RiskLevel riskLevel,

        @JsonRawValue
        String shapValues,

        LocalDateTime createdAt,

        Boolean highBp,
        Boolean highChol,
        Boolean cholCheck,
        Double bmi,
        Boolean smoker,
        Boolean stroke,
        Boolean heartDiseaseOrAttack,
        Boolean physActivity,
        Boolean fruits,
        Boolean veggies,
        Boolean hvyAlcoholConsump,
        Integer genHlth,
        Integer mentHlth,
        Integer physHlth,
        Boolean diffWalk,
        Sex sex,
        Integer age

) {
}