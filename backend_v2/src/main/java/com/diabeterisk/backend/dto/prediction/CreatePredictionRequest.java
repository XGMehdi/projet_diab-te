package com.diabeterisk.backend.dto.prediction;

import com.diabeterisk.backend.model.enums.Sex;

public record CreatePredictionRequest(

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