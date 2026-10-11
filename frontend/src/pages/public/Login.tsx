import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../../services/authService';

export default function Login() {
  const navigate = useNavigate();

  /* Form states */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* UI states */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Login handler */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const data = await login({ email, password });

      localStorage.setItem('token', data.token);

      // Fetch user info to determine role
      const { getMe } = await import('../../services/authService');
      const user = await getMe();
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/utilisateurs');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        setError(`Erreur Serveur: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else {
        setError(`Erreur Réseau: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Link to="/" className="back-to-home">
        <span className="material-symbols-outlined">arrow_back</span>
        Retour à l'accueil
      </Link>

      <div className="login-card p-4 p-md-5">
        <div className="brand-header">
          <h1 className="h3 fw-bold mb-2">Connexion</h1>
          <p className="text-secondary small">Accédez à votre espace pour évaluer votre risque de diabète</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Adresse email</label>
            <input
              className="form-control"
              id="login-email"
              placeholder="nom@exemple.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0" htmlFor="login-password">Mot de passe</label>
              <Link className="link-secondary-ui small" to="/forgot-password">Mot de passe oublié?</Link>
            </div>
            <input
              className="form-control"
              id="login-password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button className="btn btn-primary w-100 mb-3 py-3" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="footer-links">
          <span>Vous n'avez pas de compte?</span>
          <Link className="link-secondary-ui ms-1" to="/register">Créer un compte</Link>
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
