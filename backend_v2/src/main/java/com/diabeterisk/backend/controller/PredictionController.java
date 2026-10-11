package com.diabeterisk.backend.controller;

import com.diabeterisk.backend.dto.prediction.*;
import com.diabeterisk.backend.model.Prediction;
import com.diabeterisk.backend.service.PredictionService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor

public class PredictionController {

    private final PredictionService predictionService;

    /*
     * =========================
     * CREATE
     * =========================
     */

    @PostMapping
    public PredictionResponse createPrediction(

            @RequestBody CreatePredictionRequest request,

            Authentication authentication) {

        return predictionService.createPrediction(
                request,
                authentication);
    }

    /*
     * =========================
     * HISTORY
     * =========================
     */

    @GetMapping
    public List<PredictionResponse> getHistory(
            Authentication authentication) {

        return predictionService
                .getHistory(authentication);
    }

    /*
     * =========================
     * GET BY ID
     * =========================
     */

    @GetMapping("/{id}")
    public Prediction getPredictionById(

            @PathVariable Long id,

            Authentication authentication) {

        return predictionService
                .getPredictionById(
                        id,
                        authentication);
    }

    /*
     * =========================
     * GET BY DATE
     * =========================
     */

    @GetMapping("/by-date")
    public Prediction getPredictionByDate(

            @RequestParam LocalDate date,

            Authentication authentication

    ) {

        return predictionService
                .getPredictionByDate(
                        date,
                        authentication);
    }
}