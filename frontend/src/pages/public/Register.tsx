import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../../services/authService';

export default function Register() {
  const navigate = useNavigate();

  /* Form states */
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* UI states */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Register handler */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await register({ nom, prenom, dateNaissance, email, password });

      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="register-container">

        <div className="card shadow-lg p-4 border-0" style={{ borderRadius: '12px' }}>
          <div className="text-center mb-4">
            <h1 className="fw-bold h3 mb-2">Créer un compte</h1>
            <p className="text-secondary small">Inscrivez-vous pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="reg-firstName">Prénom</label>
                <input
                  className="form-control"
                  id="reg-firstName"
                  placeholder="Jean"
                  required
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="reg-lastName">Nom</label>
                <input
                  className="form-control"
                  id="reg-lastName"
                  placeholder="Dupont"
                  required
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-birthDate">Date de naissance</label>
              <input
                className="form-control"
                id="reg-birthDate"
                required
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                className="form-control"
                id="reg-email"
                placeholder="nom@exemple.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-password">Mot de passe</label>
              <input
                className="form-control"
                id="reg-password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="reg-confirmPassword">Confirmer le mot de passe</label>
              <input
                className="form-control"
                id="reg-confirmPassword"
                placeholder="••••••••"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <button className="btn btn-primary w-100 py-3 fw-bold" type="submit" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <div className="footer-links">
            <span className="text-muted">Vous avez déjà un compte ?</span>{' '}
            <Link to="/login" className="link-secondary-ui">Se connecter</Link>
          </div>
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
