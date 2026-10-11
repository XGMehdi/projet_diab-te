import { Link } from 'react-router-dom';
import { useState } from 'react';
import { forgotPassword } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de l'envoi de l'email de réinitialisation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Link to="/login" className="back-to-home">
        <span className="material-symbols-outlined">arrow_back</span>
        Retour à la connexion
      </Link>

      <div className="login-card p-4 p-md-5">
        <div className="brand-header">
          <div className="d-flex justify-content-center mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)',
              }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>
                lock_reset
              </span>
            </div>
          </div>
          <h1 className="h3 fw-bold mb-2">Mot de passe oublié ?</h1>
          <p className="text-secondary small">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
              }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '40px' }}>
                mark_email_read
              </span>
            </div>
            <h2 className="h5 fw-bold mb-2">Email envoyé !</h2>
            <p className="text-secondary small mb-4">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              <br />
              Vérifiez votre boîte de réception (et vos spams).
            </p>
            <p className="text-muted small mb-3">
              <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '16px' }}>
                timer
              </span>
              Le lien expire dans 30 minutes.
            </p>
            <Link to="/login" className="btn btn-primary w-100 py-3">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label" htmlFor="forgot-email">
                Adresse email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    mail
                  </span>
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  id="forgot-email"
                  placeholder="nom@exemple.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <button className="btn btn-primary w-100 mb-3 py-3" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined align-middle me-2" style={{ fontSize: '20px' }}>
                    send
                  </span>
                  Envoyer le lien de réinitialisation
                </>
              )}
            </button>
          </form>
        )}

        <div className="footer-links">
          <span>Vous vous souvenez ?</span>
          <Link className="link-secondary-ui ms-1" to="/login">
            Se connecter
          </Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="bg-decoration">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBloiNAk0b4FAyAOyrCN4PNo1xGCgb53uZ5L1AbnCRVtuvzrAO1vtgDaD6UxP_HPddHG7kZ_XlbGytcdMZkpxicCx_SdMYmbvZ2vOcGKSQ2qAMPaymTyqYfaDmlHheh2rDTmHlX5gJRDjll-1GqKZCfM3zeL5t8J3B4--jfC2c0_iIrAVgxdleQ53tyvHcF0x2ukXrIqgZEmvvm55VV2vDomhHSz5c3ctZ8Sn761mf8wCBwrMtj1u26Nw-ieriy7Lr2WyunTl7xIts"
          alt="Medical background"
        />
      </div>
    </div>
  );
}
