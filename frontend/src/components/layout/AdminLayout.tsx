import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AppFooter from './AppFooter';

/**
 * Shared layout wrapper for admin pages.
 * Provides Admin Navbar + content area + Footer.
 */
export default function AdminLayout() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <AdminNavbar />
      <main className="container py-5 flex-grow-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
