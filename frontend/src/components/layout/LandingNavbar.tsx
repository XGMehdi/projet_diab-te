import { Link } from 'react-router-dom';

/**
 * Navbar for the public landing page
 */
export default function LandingNavbar() {
  return (
    <nav className="navbar navbar-expand-lg sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand fs-3" to="/">DiabeteRisk</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><a className="nav-link" href="#accueil">Accueil</a></li>
            <li className="nav-item"><a className="nav-link" href="#fonctionnement">Fonctionnement</a></li>
            <li className="nav-item"><a className="nav-link" href="#avantages">Avantages</a></li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <Link className="nav-link text-decoration-none p-0 me-3" to="/login">Connexion</Link>
            <Link className="btn btn-primary px-4" to="/register">Inscription</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
