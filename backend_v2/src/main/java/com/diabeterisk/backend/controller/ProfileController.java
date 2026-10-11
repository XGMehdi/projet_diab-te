package com.diabeterisk.backend.controller;

import com.diabeterisk.backend.dto.profile.*;
import com.diabeterisk.backend.service.ProfileService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor

public class ProfileController {

    private final ProfileService profileService;

    /*
    =========================
    UPDATE PROFILE
    =========================
    */

    @PutMapping("/update")
    public ProfileResponse updateProfile(

            @Valid
            @RequestBody
            UpdateProfileRequest request,

            Authentication authentication

    ) {

        return profileService.updateProfile(
                request,
                authentication
        );
    }

    /*
    =========================
    CHANGE PASSWORD
    =========================
    */

    @PutMapping("/change-password")
    public void changePassword(

            @Valid
            @RequestBody
            ChangePasswordRequest request,

            Authentication authentication

    ) {

        profileService.changePassword(
                request,
                authentication
        );
    }
}