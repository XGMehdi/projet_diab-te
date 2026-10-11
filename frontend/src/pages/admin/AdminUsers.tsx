import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, deleteAdminUser, AdminUser } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 403) {
        setError('Accès refusé. Vous devez être administrateur.');
      } else {
        setError('Impossible de charger les utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Erreur lors de la suppression');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const riskBadges: Record<string, { label: string; cls: string }> = {
    HIGH: { label: 'Élevé', cls: 'badge-error' },
    MODERATE: { label: 'Modéré', cls: 'badge-secondary-custom' },
    LOW: { label: 'Faible', cls: 'badge-tertiary' },
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner message="Chargement des utilisateurs..." />;

  return (
    <>
      {/* Header */}
      <div className="row mb-4 align-items-end">
        <div className="col-md-7 mb-3 mb-md-0">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="admin-icon-badge">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="h2 mb-0 fw-bold">Gestion des Utilisateurs</h1>
              <p className="text-secondary-custom mb-0 mt-1">
                Consultez, gérez et supervisez les comptes utilisateurs de la plateforme.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-5 d-flex justify-content-md-end gap-3">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-surface border-end-0">
              <span className="material-symbols-outlined text-secondary-custom">search</span>
            </span>
            <input
              className="form-control bg-surface border-start-0 ps-0"
              placeholder="Rechercher un utilisateur..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-custom-outline"
            onClick={() => navigate('/admin/statistiques')}
          >
            <span className="material-symbols-outlined">analytics</span>
            Statistiques
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card card-custom p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <div className="text-label-sm text-secondary-custom">Total Utilisateurs</div>
                <div className="fs-4 fw-bold">{users.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box-tertiary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="text-label-sm text-secondary-custom">Utilisateurs</div>
                <div className="fs-4 fw-bold">{users.filter((u) => u.role === 'USER').length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box-secondary">
                <span className="material-symbols-outlined">shield_person</span>
              </div>
              <div>
                <div className="text-label-sm text-secondary-custom">Administrateurs</div>
                <div className="fs-4 fw-bold">{users.filter((u) => u.role === 'ADMIN').length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="admin-icon-badge-sm" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div className="text-label-sm text-secondary-custom">Risque Élevé</div>
                <div className="fs-4 fw-bold">
                  {users.filter((u) => u.latestRiskLevel === 'HIGH').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm-custom mb-5 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light text-label-sm text-secondary-custom">
              <tr>
                <th className="py-3 px-4 fw-medium border-bottom-0">Utilisateur</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Email</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Rôle</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Prédictions</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Dernier Risque</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Inscrit le</th>
                <th className="py-3 px-4 fw-medium border-bottom-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="text-center py-5 text-secondary" colSpan={7}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const riskInfo = u.latestRiskLevel
                    ? riskBadges[u.latestRiskLevel] || riskBadges.LOW
                    : null;

                  return (
                    <tr key={u.id}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="admin-user-avatar">
                            {u.prenom.charAt(0)}{u.nom.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-medium">{u.prenom} {u.nom}</div>
                            {u.dateNaissance && (
                              <div className="small text-secondary-custom">
                                Né(e) le {formatDate(u.dateNaissance)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-secondary-custom">{u.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-medium ${
                            u.role === 'ADMIN' ? 'admin-badge-admin' : 'admin-badge-user'
                          }`}
                        >
                          {u.role === 'ADMIN' ? '👑 Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="fw-semibold">{u.totalPredictions}</span>
                      </td>
                      <td className="py-3 px-4">
                        {riskInfo ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill ${riskInfo.cls} px-3 py-2 fw-medium`}>
                              {riskInfo.label}
                            </span>
                            <span className="small fw-medium text-secondary-custom">
                              {u.latestRiskScore ? `${Math.round(u.latestRiskScore * 100)}%` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-secondary-custom small">Aucune</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="small text-secondary-custom">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-inline-flex gap-2">
                          {u.totalPredictions > 0 && (
                            <button
                              className="btn btn-link text-primary-custom p-1 rounded-circle"
                              title="Voir les prédictions"
                              onClick={() => navigate(`/admin/utilisateurs/${u.id}/predictions`)}
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                          )}
                          {u.role !== 'ADMIN' && (
                            <>
                              {deleteConfirm === u.id ? (
                                <div className="d-inline-flex gap-1 align-items-center">
                                  <button
                                    className="btn btn-danger btn-sm px-3"
                                    onClick={() => handleDelete(u.id)}
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-link text-danger p-1 rounded-circle"
                                  title="Supprimer l'utilisateur"
                                  onClick={() => setDeleteConfirm(u.id)}
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-surface-low border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="text-label-sm text-secondary-custom">
            Affichage {filteredUsers.length} / {users.length} utilisateur(s)
          </span>
        </div>
      </div>
    </>
  );
}
