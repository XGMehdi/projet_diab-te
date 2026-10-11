/**
 * Footer for authenticated (app) pages
 */
export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
        <div className="mb-3 mb-md-0">
          <span className="fw-bold text-dark me-2">DiabeteRisk</span>
          <span>© 2024 DiabeteRisk. Tous droits réservés.</span>
        </div>
        <div className="d-flex gap-4">
          <a className="text-muted text-decoration-none" href="#">Confidentialité</a>
          <a className="text-muted text-decoration-none" href="#">Mentions Légales</a>
          <a className="text-muted text-decoration-none" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
