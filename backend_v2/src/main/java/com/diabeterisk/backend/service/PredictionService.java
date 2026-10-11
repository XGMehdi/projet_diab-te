package com.diabeterisk.backend.service;

import com.diabeterisk.backend.dto.prediction.*;
import com.diabeterisk.backend.model.Prediction;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.model.enums.RiskLevel;
import com.diabeterisk.backend.repository.PredictionRepository;
import com.diabeterisk.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;

    private final UserRepository userRepository;

    /*
     * =========================
     * CREATE PREDICTION
     * =========================
     */

    public PredictionResponse createPrediction(

            CreatePredictionRequest request,

            Authentication authentication

    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        /*
         * ==============================================================
         * INTÉGRATION FAST API (MACHINE LEARNING MODEL)
         * ==============================================================
         * Ici, vous ferez l'appel HTTP vers votre backend FastAPI Python.
         * Exemple d'implémentation (à décommenter quand FastAPI sera prêt) :
         */
        
        double riskScore;
        RiskLevel riskLevel;
        String shapValues;
        try {
            var restTemplate = new org.springframework.web.client.RestTemplate();
            FastApiResponse response = restTemplate.postForObject(
                    "http://localhost:8000/predict", request, FastApiResponse.class);
            if (response == null || response.getRiskScore() == null || response.getRiskLevel() == null
                    || response.getShapValuesAsJsonString() == null
                    || !Double.isFinite(response.getRiskScore())
                    || response.getRiskScore() < 0 || response.getRiskScore() > 1) {
                throw new IllegalStateException("Invalid ML response");
            }
            riskScore = response.getRiskScore();
            riskLevel = response.getRiskLevel();
            shapValues = response.getShapValuesAsJsonString();
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "ML prediction unavailable", e);
        }

        /*
         * =========================
         * SAVE
         * =========================
         */

        Prediction prediction = Prediction.builder()

                .user(user)

                .highBp(request.highBp())
                .highChol(request.highChol())
                .cholCheck(request.cholCheck())
                .bmi(request.bmi())
                .smoker(request.smoker())
                .stroke(request.stroke())
                .heartDiseaseOrAttack(
                        request.heartDiseaseOrAttack())
                .physActivity(request.physActivity())
                .fruits(request.fruits())
                .veggies(request.veggies())
                .hvyAlcoholConsump(
                        request.hvyAlcoholConsump())
                .genHlth(request.genHlth())
                .mentHlth(request.mentHlth())
                .physHlth(request.physHlth())
                .diffWalk(request.diffWalk())
                .sex(request.sex())
                .age(request.age())

                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .shapValues(shapValues)

                .build();

        predictionRepository.save(prediction);

        return new PredictionResponse(

                prediction.getId(),
                prediction.getRiskScore(),
                prediction.getRiskLevel(),
                prediction.getShapValues(),
                prediction.getCreatedAt(),
                prediction.getHighBp(),
                prediction.getHighChol(),
                prediction.getCholCheck(),
                prediction.getBmi(),
                prediction.getSmoker(),
                prediction.getStroke(),
                prediction.getHeartDiseaseOrAttack(),
                prediction.getPhysActivity(),
                prediction.getFruits(),
                prediction.getVeggies(),
                prediction.getHvyAlcoholConsump(),
                prediction.getGenHlth(),
                prediction.getMentHlth(),
                prediction.getPhysHlth(),
                prediction.getDiffWalk(),
                prediction.getSex(),
                prediction.getAge()
        );
    }

    /*
     * =========================
     * HISTORY
     * =========================
     */

    public List<PredictionResponse> getHistory(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        return predictionRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(prediction -> new PredictionResponse(
                        prediction.getId(),
                        prediction.getRiskScore(),
                        prediction.getRiskLevel(),
                        prediction.getShapValues(),
                        prediction.getCreatedAt(),
                        prediction.getHighBp(),
                        prediction.getHighChol(),
                        prediction.getCholCheck(),
                        prediction.getBmi(),
                        prediction.getSmoker(),
                        prediction.getStroke(),
                        prediction.getHeartDiseaseOrAttack(),
                        prediction.getPhysActivity(),
                        prediction.getFruits(),
                        prediction.getVeggies(),
                        prediction.getHvyAlcoholConsump(),
                        prediction.getGenHlth(),
                        prediction.getMentHlth(),
                        prediction.getPhysHlth(),
                        prediction.getDiffWalk(),
                        prediction.getSex(),
                        prediction.getAge()))
                .toList();
    }

    /*
     * =========================
     * GET BY ID
     * =========================
     */

    public Prediction getPredictionById(
            Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow();

        /*
         * SECURITY
         */

        if (!prediction.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Access denied");
        }

        return prediction;
    }

    public Prediction getPredictionByDate(

            LocalDate date,

            Authentication authentication

    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        return predictionRepository
                .findByUserAndDate(user, date)
                .orElseThrow(() -> new RuntimeException(
                        "Prediction not found"));
    }
}