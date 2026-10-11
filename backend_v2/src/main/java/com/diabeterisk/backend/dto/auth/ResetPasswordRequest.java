package com.diabeterisk.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank
        String token,

        @NotBlank
        @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
        String newPassword

) {
}
