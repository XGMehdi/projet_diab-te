package com.diabeterisk.backend.service;

import com.diabeterisk.backend.dto.profile.*;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    /*
    =========================
    GET CURRENT USER
    =========================
    */

    private User getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow();
    }

    /*
    =========================
    UPDATE PROFILE
    =========================
    */

    public ProfileResponse updateProfile(

            UpdateProfileRequest request,

            Authentication authentication

    ) {

        User user = getCurrentUser(authentication);

        user.setNom(request.nom());

        user.setPrenom(request.prenom());

        user.setDateNaissance(
                request.dateNaissance()
        );

        userRepository.save(user);

        return new ProfileResponse(

                user.getId(),

                user.getNom(),

                user.getPrenom(),

                user.getEmail(),

                user.getDateNaissance()
        );
    }

    /*
    =========================
    CHANGE PASSWORD
    =========================
    */

    public void changePassword(

            ChangePasswordRequest request,

            Authentication authentication

    ) {

        User user = getCurrentUser(authentication);

        /*
        VERIFY CURRENT PASSWORD
        */

        boolean matches =
                passwordEncoder.matches(

                        request.currentPassword(),

                        user.getPasswordHash()
                );

        if (!matches) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        /*
        UPDATE PASSWORD
        */

        user.setPasswordHash(

                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);
    }
}