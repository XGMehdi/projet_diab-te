-- ==========================================
-- Insertion d'un utilisateur de test
-- Le mot de passe est 'password123', hashé avec BCrypt
-- ==========================================
INSERT INTO users (email, password_hash, nom, prenom, date_naissance, role, created_at)
VALUES 
('soufiane@gmail.com', '$2a$10$Dow.O5i9A1qZ.o5lH/rA/.y.2P0s8N0O7M1a4Hh1oZ5L1H1yA.9wO', 'Elkasraoui', 'Soufiane', '2004-08-15', 'USER', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET role = COALESCE(EXCLUDED.role, users.role, 'USER');

-- ==========================================
-- Insertion d'un administrateur
-- Email: admin@diabeterisk.com / Mot de passe: admin123
-- ==========================================
INSERT INTO users (email, password_hash, nom, prenom, date_naissance, role, created_at)
VALUES 
('admin@diabeterisk.com', '$2a$10$Dow.O5i9A1qZ.o5lH/rA/.y.2P0s8N0O7M1a4Hh1oZ5L1H1yA.9wO', 'Admin', 'DiabeteRisk', '1990-01-01', 'ADMIN', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- ==========================================
-- Insertion de prédictions de test pour l'utilisateur id=1
-- Cela permet d'avoir des données pour le Dashboard dès le lancement
-- ==========================================
INSERT INTO predictions (
    user_id, high_bp, high_chol, chol_check, bmi, smoker, stroke, heart_disease_or_attack, 
    phys_activity, fruits, veggies, hvy_alcohol_consump, gen_hlth, ment_hlth, phys_hlth, 
    diff_walk, sex, age, risk_score, risk_level, shap_values, created_at
) VALUES 
(1, true, true, true, 31.2, false, false, false, false, true, true, false, 4, 4, 7, false, 'MALE', 8, 0.82, 'HIGH', '{"bmi": 0.32, "genHlth": 0.21, "physActivity": -0.15}', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, false, false, true, 22.1, false, false, false, true, true, true, false, 1, 0, 0, false, 'MALE', 2, 0.14, 'LOW', '{"bmi": 0.05, "genHlth": 0.03, "physActivity": -0.08}', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(1, true, false, true, 26.5, true, false, false, true, false, true, false, 3, 2, 3, false, 'MALE', 5, 0.45, 'MODERATE', '{"bmi": 0.18, "genHlth": 0.12}', CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT DO NOTHING;
