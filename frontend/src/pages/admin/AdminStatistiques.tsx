import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminUsers, AdminStats, AdminUser } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminStatistiques() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([getAdminStats(), getAdminUsers()]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 403) {
        setError('Accès refusé.');
      } else {
        setError('Impossible de charger les statistiques');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Chargement des statistiques..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;

  // Computed stats
  const highRiskUsers = users.filter((u) => u.latestRiskLevel === 'HIGH');
  const avgPredictionsPerUser = stats.totalUsers > 0
    ? (stats.totalPredictions / stats.totalUsers).toFixed(1)
    : '0';

  const riskDistributionTotal = stats.highRiskCount + stats.moderateRiskCount + stats.lowRiskCount;
  const highPct = riskDistributionTotal > 0 ? ((stats.highRiskCount / riskDistributionTotal) * 100).toFixed(1) : '0';
  const modPct = riskDistributionTotal > 0 ? ((stats.moderateRiskCount / riskDistributionTotal) * 100).toFixed(1) : '0';
  const lowPct = riskDistributionTotal > 0 ? ((stats.lowRiskCount / riskDistributionTotal) * 100).toFixed(1) : '0';

  // Top risky users (sort by latest risk score desc)
  const topRiskyUsers = [...users]
    .filter((u) => u.latestRiskScore !== null && u.latestRiskScore !== undefined)
    .sort((a, b) => (b.latestRiskScore || 0) - (a.latestRiskScore || 0))
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <button
            className="btn btn-custom-text mb-3 d-flex align-items-center gap-1 ps-0"
            onClick={() => navigate('/admin/utilisateurs')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Retour aux utilisateurs
          </button>
          <div className="d-flex align-items-center gap-3">
            <div className="admin-icon-badge">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h1 className="h2 mb-0 fw-bold">Statistiques de la Plateforme</h1>
              <p className="text-secondary-custom mb-0 mt-1">
                Vue d'ensemble des données et tendances de la plateforme DiabeteRisk.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card card-custom h-100 p-4 admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="icon-box-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="admin-stat-trend admin-stat-trend-up">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                +{stats.newUsersThisMonth}
              </span>
            </div>
            <h6 className="text-secondary-custom mb-1">Total Utilisateurs</h6>
            <div className="fs-2 fw-bold">{stats.totalUsers}</div>
            <div className="small text-secondary-custom mt-1">
              {stats.newUsersThisMonth} nouveau(x) ce mois
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-custom h-100 p-4 admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="icon-box-tertiary">
                <span className="material-symbols-outlined">batch_prediction</span>
              </div>
              <span className="admin-stat-trend admin-stat-trend-up">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                +{stats.predictionsThisMonth}
              </span>
            </div>
            <h6 className="text-secondary-custom mb-1">Total Prédictions</h6>
            <div className="fs-2 fw-bold">{stats.totalPredictions}</div>
            <div className="small text-secondary-custom mt-1">
              {stats.predictionsThisMonth} ce mois • {avgPredictionsPerUser}/utilisateur
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-custom h-100 p-4 admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="icon-box-secondary">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
            </div>
            <h6 className="text-secondary-custom mb-1">Score Moyen</h6>
            <div className="fs-2 fw-bold text-primary-custom">
              {Math.round(stats.averageRiskScore * 100)}%
            </div>
            <div className="small text-secondary-custom mt-1">
              Score de risque moyen global
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-custom h-100 p-4 admin-stat-card" style={{ borderLeft: '4px solid #ba1a1a' }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="admin-icon-badge-sm" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <h6 className="text-secondary-custom mb-1">Cas à Risque Élevé</h6>
            <div className="fs-2 fw-bold" style={{ color: '#ba1a1a' }}>{stats.highRiskCount}</div>
            <div className="small text-secondary-custom mt-1">
              {highRiskUsers.length} utilisateur(s) actuellement à haut risque
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Risk Distribution */}
        <div className="col-lg-6">
          <div className="card card-custom h-100 p-4 p-md-5">
            <h4 className="fw-semibold mb-4">Distribution des Risques</h4>

            {/* Visual bar chart */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-medium">Élevé</span>
                <span className="fw-semibold">{stats.highRiskCount} ({highPct}%)</span>
              </div>
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill"
                  style={{ width: `${highPct}%`, backgroundColor: '#ba1a1a' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-medium">Modéré</span>
                <span className="fw-semibold">{stats.moderateRiskCount} ({modPct}%)</span>
              </div>
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill"
                  style={{ width: `${modPct}%`, backgroundColor: '#f0ad4e' }}
                />
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-medium">Faible</span>
                <span className="fw-semibold">{stats.lowRiskCount} ({lowPct}%)</span>
              </div>
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill"
                  style={{ width: `${lowPct}%`, backgroundColor: '#00677c' }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-surface-low rounded-3">
              <div className="d-flex justify-content-between text-label-sm">
                <span className="text-secondary-custom">Total des prédictions</span>
                <span className="fw-bold">{riskDistributionTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Risky Users */}
        <div className="col-lg-6">
          <div className="card card-custom h-100 p-4 p-md-5">
            <h4 className="fw-semibold mb-4">Utilisateurs à Plus Haut Risque</h4>

            {topRiskyUsers.length === 0 ? (
              <div className="text-center text-secondary py-5">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topRiskyUsers.map((u, idx) => {
                  const riskPct = Math.round((u.latestRiskScore || 0) * 100);
                  const riskColor =
                    u.latestRiskLevel === 'HIGH'
                      ? '#ba1a1a'
                      : u.latestRiskLevel === 'MODERATE'
                      ? '#f0ad4e'
                      : '#00677c';
                  return (
                    <div
                      key={u.id}
                      className="admin-top-user-row"
                      onClick={() => {
                        if (u.totalPredictions > 0) {
                          navigate(`/admin/utilisateurs/${u.id}/predictions`);
                        }
                      }}
                      style={{ cursor: u.totalPredictions > 0 ? 'pointer' : 'default' }}
                    >
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <span className="admin-rank-badge">{idx + 1}</span>
                        <div className="admin-user-avatar admin-user-avatar-sm">
                          {u.prenom.charAt(0)}{u.nom.charAt(0)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{u.prenom} {u.nom}</div>
                          <div className="small text-secondary-custom">{u.email}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div className="admin-risk-indicator" style={{ borderColor: riskColor }}>
                          <span className="fw-bold" style={{ color: riskColor }}>{riskPct}%</span>
                        </div>
                        <span className="material-symbols-outlined text-secondary-custom" style={{ fontSize: '18px' }}>
                          chevron_right
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="card card-custom p-4 p-md-5">
            <h4 className="fw-semibold mb-4">Résumé d'Activité</h4>
            <div className="row g-4">
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-primary">
                    <span className="fw-bold fs-5">{stats.totalUsers}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Utilisateurs</div>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-tertiary">
                    <span className="fw-bold fs-5">{stats.totalPredictions}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Prédictions</div>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-danger">
                    <span className="fw-bold fs-5">{stats.highRiskCount}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Risque Élevé</div>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-warning">
                    <span className="fw-bold fs-5">{stats.moderateRiskCount}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Risque Modéré</div>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-success">
                    <span className="fw-bold fs-5">{stats.lowRiskCount}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Risque Faible</div>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="text-center">
                  <div className="admin-circle-stat admin-circle-stat-info">
                    <span className="fw-bold fs-5">{avgPredictionsPerUser}</span>
                  </div>
                  <div className="small text-secondary-custom mt-2 fw-medium">Moy. / Utilisateur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
