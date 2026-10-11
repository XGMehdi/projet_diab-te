package com.diabeterisk.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(

        @NotBlank
        String currentPassword,

        @NotBlank
        String newPassword

) {
}