package com.diabeterisk.backend.dto.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminUserResponse(

        Long id,

        String nom,

        String prenom,

        String email,

        LocalDate dateNaissance,

        String role,

        LocalDateTime createdAt,

        long totalPredictions,

        Double latestRiskScore,

        String latestRiskLevel

) {
}
