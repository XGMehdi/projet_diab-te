package com.diabeterisk.backend.dto.auth;

import java.time.LocalDate;

public record UserResponse(

        Long id,

        String nom,

        String prenom,

        String email,

        LocalDate dateNaissance,

        String role

) {
}