import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import AppFooter from './AppFooter';

/**
 * Shared layout wrapper for all authenticated pages.
 * Provides Navbar + content area + Footer.
 */
export default function AppLayout() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <AppNavbar />
      <main className="container py-5 flex-grow-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
