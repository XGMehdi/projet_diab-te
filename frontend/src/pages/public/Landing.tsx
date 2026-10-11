import { Link } from 'react-router-dom';
import LandingNavbar from '../../components/layout/LandingNavbar';

export default function Landing() {
  return (
    <>
      <LandingNavbar />
      <main>
        {/* Hero Section */}
        <section className="hero-section" id="accueil">
          <div className="container">
            <div className="row align-items-center gy-5">
              <div className="col-lg-6">
                <span className="badge-promo">Santé Intelligente &amp; Prévention</span>
                <h1 className="hero-title">Détectez votre risque de diabète en quelques secondes</h1>
                <p className="hero-subtitle">
                  Une application intelligente qui analyse vos données de santé pour vous fournir une estimation rapide,
                  fiable et personnalisée de votre profil glycémique.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link className="btn btn-primary btn-lg px-4 py-3" to="/login">
                    Commencer maintenant
                  </Link>
                  <Link className="btn btn-outline-secondary btn-lg px-4 py-3" to="/register">
                    Créer un compte
                  </Link>
                </div>
                <div className="mt-5 d-flex align-items-center gap-3">
                  <div className="d-flex -space-x-2">
                    <span
                      className="badge rounded-circle bg-light text-primary border p-2"
                      style={{ fontSize: '10px' }}
                    >
                      +10k
                    </span>
                  </div>
                  <small className="text-secondary">Déjà plus de 10 000 analyses effectuées ce mois-ci.</small>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="hero-image-wrapper">
                  <img
                    alt="Analyse de santé IA"
                    className="img-fluid"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhrbb5wEIECY4Jlnr4MGDEBxQeuQAExH2376xkyOnbcJgMbkRhe16vBtZsFe72Z-NZdDNPJLZwWaSycoUM5tUdrZdp98_2Cy7r0ZizQ_gvNdAXAm5u4O5ZXWI2B_l2jFFuPULetN4QS3T8g5lqk1c98HZNce2f4EnDdMJ1MALE9F1tXNB11AgAVOPERo8lorg1KIegPWXiqO4vr0OJMAUC0-1n6Cp83uqQnbczqvxmX8V7vXD_Ga5fPMu68eGH2AlBTUnopq0ApPo"
                  />
                  <div className="floating-card">
                    <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <div className="fw-bold small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>
                        Précision IA
                      </div>
                      <div className="fw-bold">Résultats en temps réel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works" id="fonctionnement">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold h1 mb-3">Comment ça marche</h2>
              <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                Trois étapes simples pour obtenir une vision claire de votre santé métabolique sans examens complexes.
              </p>
            </div>
            <div className="row g-4 text-center">
              <div className="col-md-4">
                <div className="step-card">
                  <div className="icon-box">
                    <span className="material-symbols-outlined fs-2">edit_note</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Saisissez vos données</h3>
                  <p className="text-secondary small mb-0">
                    Remplissez un court questionnaire sur vos habitudes de vie, votre hérédité et vos mesures de base.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="step-card">
                  <div className="icon-box">
                    <span className="material-symbols-outlined fs-2">psychology</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Analyse intelligente</h3>
                  <p className="text-secondary small mb-0">
                    Notre algorithme entraîné sur des milliers de cas cliniques traite vos informations instantanément.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="step-card">
                  <div className="icon-box">
                    <span className="material-symbols-outlined fs-2">verified</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Obtenez vos résultats</h3>
                  <p className="text-secondary small mb-0">
                    Recevez un score de risque détaillé et des recommandations personnalisées pour agir dès maintenant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="benefits-section" id="avantages">
          <div className="container">
            <div className="row align-items-center gy-5">
              <div className="col-lg-6 order-2 order-lg-1">
                <div className="row g-3 benefit-img-grid">
                  <div className="col-6">
                    <img
                      alt="Smart Health tracking"
                      className="img-fluid mb-3"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8cgobFwY6yUYu2HCIhdRjR2azeBZH0hgSN6pD_J2bKXtC2_mf48FObiOwyqgWZ4XTs8qfcDO71Ictue5RxoVB2XH_RIOeCQ5D2MOO7OTAlxX1rXtEMKX1ff12Q7S8JDqYX8SWeiqsrmeCbJRbLeRHC85LUZTdYTKrs1apizP-PDOo6u2cbKxtxhvnqmdcI9LFUPJUL0UIKXTLqVDeNpXIciFHsC6ilHlhIqh1GQoPnlCLjFMmsYxN7HNjRhrGZV_ZeXesBOU4LE"
                    />
                    <div className="stat-card">
                      <h3 className="fw-extrabold mb-1">98%</h3>
                      <p className="small mb-0 opacity-75">Taux de satisfaction utilisateur</p>
                    </div>
                  </div>
                  <div className="col-6 mt-4">
                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-3 text-center">
                      <span className="material-symbols-outlined text-primary fs-3 mb-2">security</span>
                      <div className="fw-bold small">Données Sécurisées</div>
                    </div>
                    <img
                      alt="Medical context"
                      className="img-fluid"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq-wCmOCQn41kCn0mVCN-lT6BqS35L7UilBM_rJucbA8EelE8LK-65ZiXro_fSHVgjSG4N-juEYllW0mmfm6v1P_Q2d5biC6N1vT3fAMh8Oj4FZHsFHt_Bg6b_2ZIsBZVz19NGw8u5P1Iu8i6TEUHIT6tTQK4QPxknphXy0uuw2i98CZhvt_nc7nxxHMx3eo4s42v-oJU36m9m3aqAgyOuw7UEEwffwXCBss3KfDhFJ0gfI_IcnmSLmLD6wqFkDH3CRbWaoMr4xts"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5 order-1 order-lg-2">
                <h2 className="fw-bold h1 mb-5">Pourquoi utiliser notre application ?</h2>
                {[
                  { icon: 'bolt', title: 'Rapide et simple', desc: 'Moins de 2 minutes suffisent pour réaliser une analyse complète de votre profil de risque.' },
                  { icon: 'clinical_notes', title: 'Basé sur des données médicales', desc: "Nos modèles s'appuient sur des études cliniques validées pour garantir la pertinence des résultats." },
                  { icon: 'visibility', title: 'Résultats clairs', desc: 'Pas de jargon médical complexe. Nous vous donnons des indicateurs compréhensibles immédiatement.' },
                  { icon: 'groups', title: 'Accessible à tous', desc: 'Une interface pensée pour être utilisée par tous, quel que soit votre niveau technique.' },
                ].map((benefit) => (
                  <div className="benefit-item" key={benefit.icon}>
                    <div className="benefit-icon">
                      <span className="material-symbols-outlined">{benefit.icon}</span>
                    </div>
                    <div>
                      <h4 className="h5 fw-bold mb-1">{benefit.title}</h4>
                      <p className="text-secondary small">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-container">
              <h2 className="display-5 fw-bold mb-3">Prenez votre santé en main dès aujourd'hui</h2>
              <p className="lead opacity-90 mb-5 mx-auto" style={{ maxWidth: '700px' }}>
                Rejoignez des milliers d'utilisateurs qui ont déjà fait le premier pas vers une prévention active et
                sereine.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link className="btn btn-light btn-lg px-5 py-3 fw-bold text-primary" to="/register">
                  Créer un compte
                </Link>
                <Link className="btn btn-outline-light btn-lg px-5 py-3 fw-bold" to="/login">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-md-6">
              <div className="h4 fw-bold mb-2">DiabeteRisk</div>
              <p className="text-secondary small mb-0">
                Application académique — Projet de fin d'année.
                <br />
                Analyse intelligente pour la santé.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex flex-wrap gap-4 justify-content-md-end">
                <a className="text-secondary text-decoration-none small" href="#">À propos</a>
                <a className="text-secondary text-decoration-none small" href="#">Confidentialité</a>
                <a className="text-secondary text-decoration-none small" href="#">Conditions</a>
                <a className="text-secondary text-decoration-none small" href="#">Contact</a>
              </div>
            </div>
          </div>
          <hr className="my-4 opacity-10" />
          <div className="text-center text-md-start small text-secondary">
            DiabeteRisk - Projet Académique © 2024. Analyse intelligente pour la santé.
          </div>
        </div>
      </footer>
    </>
  );
}
