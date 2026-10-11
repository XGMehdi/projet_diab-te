/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/* Layout */
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

/* Public Pages */
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

/* App Pages (authenticated) */
import Dashboard from './pages/app/Dashboard';
import Prediction from './pages/app/Prediction';
import Historique from './pages/app/Historique';
import Profile from './pages/app/Profile';

/* Admin Pages (authenticated + admin role) */
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserPredictions from './pages/admin/AdminUserPredictions';
import AdminStatistiques from './pages/admin/AdminStatistiques';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            PUBLIC ROUTES
            ========================================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ==========================================
            PROTECTED ROUTES (shared layout)
            ========================================== */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/profil" element={<Profile />} />
        </Route>

        {/* ==========================================
            ADMIN ROUTES (admin layout)
            ========================================== */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/utilisateurs" element={<AdminUsers />} />
          <Route path="/admin/utilisateurs/:userId/predictions" element={<AdminUserPredictions />} />
          <Route path="/admin/statistiques" element={<AdminStatistiques />} />
        </Route>
      </Routes>
    </Router>
  );
}
