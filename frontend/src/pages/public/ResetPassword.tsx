import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { resetPassword } from '../../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors de la réinitialisation du mot de passe.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="login-card p-4 p-md-5 text-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '40px' }}>
              link_off
            </span>
          </div>
          <h1 className="h4 fw-bold mb-2">Lien invalide</h1>
          <p className="text-secondary small mb-4">
            Ce lien de réinitialisation est invalide ou a expiré.
            <br />
            Veuillez refaire une demande.
          </p>
          <Link to="/forgot-password" className="btn btn-primary w-100 py-3">
            Nouvelle demande
          </Link>
        </div>
        <div className="bg-decoration">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBloiNAk0b4FAyAOyrCN4PNo1xGCgb53uZ5L1AbnCRVtuvzrAO1vtgDaD6UxP_HPddHG7kZ_XlbGytcdMZkpxicCx_SdMYmbvZ2vOcGKSQ2qAMPaymTyqYfaDmlHheh2rDTmHlX5gJRDjll-1GqKZCfM3zeL5t8J3B4--jfC2c0_iIrAVgxdleQ53tyvHcF0x2ukXrIqgZEmvvm55VV2vDomhHSz5c3ctZ8Sn761mf8wCBwrMtj1u26Nw-ieriy7Lr2WyunTl7xIts"
            alt="Medical background"
          />
        </div>
      </div>
    );
  }

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
                password
              </span>
            </div>
          </div>
          <h1 className="h3 fw-bold mb-2">Nouveau mot de passe</h1>
          <p className="text-secondary small">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
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
                check_circle
              </span>
            </div>
            <h2 className="h5 fw-bold mb-2">Mot de passe modifié !</h2>
            <p className="text-secondary small mb-4">
              Votre mot de passe a été réinitialisé avec succès.
              <br />
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <button
              className="btn btn-primary w-100 py-3"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="reset-password">
                Nouveau mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    lock
                  </span>
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  id="reset-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-text">Minimum 6 caractères</div>
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="reset-confirm-password">
                Confirmer le mot de passe
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    lock_reset
                  </span>
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  id="reset-confirm-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <button className="btn btn-primary w-100 mb-3 py-3" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined align-middle me-2" style={{ fontSize: '20px' }}>
                    save
                  </span>
                  Réinitialiser le mot de passe
                </>
              )}
            </button>
          </form>
        )}
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
