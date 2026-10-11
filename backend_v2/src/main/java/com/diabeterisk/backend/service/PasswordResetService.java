package com.diabeterisk.backend.service;

import com.diabeterisk.backend.model.PasswordResetToken;
import com.diabeterisk.backend.model.User;
import com.diabeterisk.backend.repository.PasswordResetTokenRepository;
import com.diabeterisk.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /*
     * =========================
     * FORGOT PASSWORD
     * =========================
     * Generates a reset token and sends an email with Mailtrap.
     */
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Aucun compte n'est associé à cet email."));

        // Generate a unique token
        String token = UUID.randomUUID().toString();

        // Create and save the token entity (valid for 30 minutes)
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Build the reset link
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // Send the email
        try {
            sendResetEmail(user.getEmail(), user.getPrenom(), resetLink);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email : " + e.getMessage());
        }
    }

    /*
     * =========================
     * RESET PASSWORD
     * =========================
     * Validates the token and updates the user's password.
     */
    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "Token de réinitialisation invalide."));

        if (resetToken.getUsed()) {
            throw new RuntimeException("Ce lien a déjà été utilisé.");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Ce lien a expiré. Veuillez refaire une demande.");
        }

        // Update the user's password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark the token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    /*
     * =========================
     * SEND EMAIL (Mailtrap)
     * =========================
     */
    private void sendResetEmail(String to, String prenom, String resetLink) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("noreply@diabeterisk.com");
        helper.setTo(to);
        helper.setSubject("DiabeteRisk - Réinitialisation de votre mot de passe");

        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #2980b9 0%%, #3498db 100%%); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">DiabeteRisk</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Réinitialisation de mot de passe</p>
                    </div>
                    <div style="padding: 32px 24px;">
                        <p style="color: #2c3e50; font-size: 16px; margin: 0 0 16px 0;">Bonjour <strong>%s</strong>,</p>
                        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau :
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #2980b9 0%%, #3498db 100%%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
                            ⏰ Ce lien expire dans <strong>30 minutes</strong>.<br/>
                            Si vous n'avez pas fait cette demande, ignorez cet email.
                        </p>
                    </div>
                    <div style="background: #f8f9fa; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 DiabeteRisk — Plateforme d'évaluation du risque de diabète</p>
                    </div>
                </div>
                """.formatted(prenom, resetLink);

        helper.setText(html, true);
        mailSender.send(message);
    }
}
