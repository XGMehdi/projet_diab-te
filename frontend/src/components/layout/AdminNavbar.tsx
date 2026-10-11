import { Link, NavLink, useNavigate } from 'react-router-dom';

/**
 * Navbar for admin pages:
 * Users, Statistics
 */
export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-3 admin-navbar">
      <div className="container">
        <Link className="navbar-brand fs-3 d-flex align-items-center gap-2" to="/admin/utilisateurs">
          <span>DiabeteRisk</span>
          <span className="admin-navbar-badge">Admin</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <div className="d-none d-md-flex align-items-center gap-4 mx-auto">
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/admin/utilisateurs"
            >
              <span className="material-symbols-outlined me-1" style={{ fontSize: '18px', verticalAlign: 'text-bottom' }}>
                group
              </span>
              Utilisateurs
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `text-decoration-none ${isActive ? 'nav-link-active' : 'nav-link-custom'}`
              }
              to="/admin/statistiques"
            >
              <span className="material-symbols-outlined me-1" style={{ fontSize: '18px', verticalAlign: 'text-bottom' }}>
                analytics
              </span>
              Statistiques
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
