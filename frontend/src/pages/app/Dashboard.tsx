import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, User } from '../../services/authService';
import { getDashboardStats, DashboardStats, getMonthlyPredictions, MonthlyPrediction } from '../../services/dashboardService';
import { getPredictions, PredictionResponse } from '../../services/predictionService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestPrediction, setLatestPrediction] = useState<PredictionResponse | null>(null);
  const [monthlyPreds, setMonthlyPreds] = useState<MonthlyPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userData, statsData, predsList, monthlyData] = await Promise.all([
          getMe(),
          getDashboardStats(),
          getPredictions(0, 5),
          getMonthlyPredictions(),
        ]);
        setUser(userData);
        setStats(statsData);
        setMonthlyPreds(monthlyData);
        if (predsList && predsList.length > 0) {
          setLatestPrediction(predsList[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les données du dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Chargement du dashboard..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  // Render risk badge details helper
  const getRiskDetails = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return { label: 'Élevé', cls: 'badge-danger-custom' };
      case 'MODERATE':
        return { label: 'Modéré', cls: 'badge-warning-custom' };
      default:
        return { label: 'Faible', cls: 'badge-info-custom' };
    }
  };

  const riskInfo = getRiskDetails(latestPrediction?.riskLevel);
  const avgRiskInfo = getRiskDetails(
    (stats?.averageRiskScore || 0) >= 0.6
      ? 'HIGH'
      : (stats?.averageRiskScore || 0) >= 0.35
      ? 'MODERATE'
      : 'LOW'
  );

  return (
    <>
      {/* Welcome Header */}
      <header className="mb-5">
        <h1 className="fw-bold mb-2">Bonjour, {user?.prenom || 'Utilisateur'}.</h1>
        <p className="fs-5 text-secondary">Voici un aperçu de votre état de santé actuel.</p>
      </header>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        {/* Card 1: Dernier Risque */}
        <div className="col-md-4">
          <div className="card card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="icon-box-secondary">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              {latestPrediction ? (
                <span className={`badge rounded-pill ${riskInfo.cls} px-3 py-2 fw-medium`}>
                  {riskInfo.label}
                </span>
              ) : (
                <span className="badge rounded-pill bg-light text-secondary px-3 py-2 fw-medium">Aucun</span>
              )}
            </div>
            <h6 className="text-secondary mb-1">Dernier risque</h6>
            <div className="fs-2 fw-semibold text-primary-custom">
              {latestPrediction ? `${Math.round(latestPrediction.riskScore * 100)}%` : '--'}
            </div>
          </div>
        </div>

        {/* Card 2: Prédictions */}
        <div className="col-md-4">
          <div className="card card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="icon-box-tertiary">
                <span className="material-symbols-outlined">batch_prediction</span>
              </div>
            </div>
            <h6 className="text-secondary mb-1">Nombre de prédictions</h6>
            <div className="fs-2 fw-semibold">{stats?.totalPredictions || 0}</div>
          </div>
        </div>

        {/* Card 3: État Global */}
        <div className="col-md-4">
          <div className="card card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="icon-box-primary">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
            </div>
            <h6 className="text-secondary mb-2">Score moyen &amp; État global</h6>
            <div className="fs-3 fw-semibold text-dark mb-3">
              {stats?.averageRiskScore ? `${Math.round(stats.averageRiskScore * 100)}%` : '--'}
              {stats?.averageRiskScore ? ` → ${avgRiskInfo.label}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Graph & Actions */}
      <div className="row g-4 mb-5">
        {/* Graph */}
        <div className="col-lg-8">
          <div className="card card-custom h-100 p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h4 className="fw-semibold mb-0">Évolution du risque (mensuel)</h4>
            </div>
            <div className="d-flex align-items-end justify-content-between gap-3" style={{ height: '200px' }}>
              {monthlyPreds.map((item, idx) => {
                // simple height scaling
                const heightPercent = Math.min(100, Math.max(10, (item.count / 10) * 100));
                const isActive = idx === monthlyPreds.length - 1;
                return (
                  <div
                    key={item.month}
                    className={`flex-grow-1 graph-bar ${isActive ? 'graph-bar-active' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.count} analyses`}
                  ></div>
                );
              })}
            </div>
            <div className="d-flex justify-content-between mt-3 small text-secondary">
              {monthlyPreds.map((item) => (
                <span key={item.month}>{item.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4 d-flex flex-column gap-3">
          <div className="action-card p-4 p-md-5 d-flex flex-column justify-content-center align-items-center text-center flex-grow-1">
            <span className="material-symbols-outlined action-card-bg-icon">add_circle</span>
            <h4 className="fw-semibold mb-3 z-3 position-relative">Agissez maintenant</h4>
            <p className="mb-4 z-3 position-relative opacity-75">
              Mettez à jour vos données pour une prédiction précise.
            </p>
            <button
              className="btn btn-light w-100 fw-bold py-3 text-primary-custom z-3 position-relative rounded-3 shadow-sm"
              onClick={() => navigate('/prediction')}
            >
              Nouvelle prédiction
            </button>
          </div>
          <button
            className="btn btn-outline-primary-custom w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2 rounded-3"
            onClick={() => navigate('/historique')}
          >
            <span className="material-symbols-outlined">history</span>
            Voir l'historique
          </button>
        </div>
      </div>
    </>
  );
}
