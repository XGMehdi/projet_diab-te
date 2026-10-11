import { Link, NavLink, useNavigate } from 'react-router-dom';

/**
 * Navbar for authenticated (app) pages:
 * Dashboard, Prediction, Historique, Profil
 */
export default function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand fs-3" to="/dashboard">DiabeteRisk</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#appNavbar"
          aria-controls="appNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="appNavbar">
          <div className="d-none d-md-flex align-items-center gap-4 mx-auto">
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/dashboard"
            >
              Dashboard
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/prediction"
            >
              Prédiction
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/historique"
            >
              Historique
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/profil"
            >
              Profil
            </NavLink>
          </div>

          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-decoration-none text-secondary d-flex align-items-center p-0"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined me-1">logout</span>
              <span className="d-none d-sm-inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
