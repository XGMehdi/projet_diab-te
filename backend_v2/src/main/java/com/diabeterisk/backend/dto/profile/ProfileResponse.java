package com.diabeterisk.backend.dto.profile;

import java.time.LocalDate;

public record ProfileResponse(

        Long id,

        String nom,

        String prenom,

        String email,

        LocalDate dateNaissance

) {
}