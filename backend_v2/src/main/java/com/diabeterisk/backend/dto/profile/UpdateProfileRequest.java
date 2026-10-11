package com.diabeterisk.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UpdateProfileRequest(

        @NotBlank
        String nom,

        @NotBlank
        String prenom,

        LocalDate dateNaissance

) {
}