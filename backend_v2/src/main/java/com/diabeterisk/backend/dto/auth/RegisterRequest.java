package com.diabeterisk.backend.dto.auth;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterRequest(

        @NotBlank
        String nom,

        @NotBlank
        String prenom,

        @Email
        @NotBlank
        String email,

        @Size(min = 6)
        String password,

        LocalDate dateNaissance

) {
}