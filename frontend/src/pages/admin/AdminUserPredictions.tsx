import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminUserPredictions,
  AdminPrediction,
} from "../../services/adminService";
import ResultModal from "../../components/ui/ResultModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminUserPredictions() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<AdminPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] =
    useState<AdminPrediction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const rowsPerPage = 4;

  useEffect(() => {
    if (!userId) return;
    fetchPredictions();
  }, [userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [predictions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const data = await getAdminUserPredictions(Number(userId));
      setPredictions(data);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 403) {
        setError("Accès refusé.");
      } else {
        setError("Impossible de charger les prédictions");
      }
    } finally {
      setLoading(false);
    }
  };

  const riskBadges: Record<string, { label: string; cls: string }> = {
    HIGH: { label: "Élevé", cls: "badge-error" },
    MODERATE: { label: "Modéré", cls: "badge-secondary-custom" },
    LOW: { label: "Faible", cls: "badge-tertiary" },
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleView = (p: AdminPrediction) => {
    setSelectedPrediction(p);
    setShowModal(true);
  };

  const buildSummaryData = (p: AdminPrediction): Record<string, string> => {
    const ageLabels: Record<string, string> = {
      "1": "18-24 ans",
      "2": "25-29 ans",
      "3": "30-34 ans",
      "4": "35-39 ans",
      "5": "40-44 ans",
      "6": "45-49 ans",
      "7": "50-54 ans",
      "8": "55-59 ans",
      "9": "60-64 ans",
      "10": "65-69 ans",
      "11": "70-74 ans",
      "12": "75-79 ans",
      "13": "80 ans+",
    };
    const genHlthLabels: Record<string, string> = {
      "1": "Excellent",
      "2": "Très bon",
      "3": "Bon",
      "4": "Moyen",
      "5": "Mauvais",
    };

    return {
      Âge: ageLabels[String(p.age || "")] || "Non spécifié",
      Sexe:
        p.sex === "MALE"
          ? "Homme"
          : p.sex === "FEMALE"
            ? "Femme"
            : "Non spécifié",
      IMC: p.bmi !== undefined ? String(p.bmi) : "--",
      Hypertension: p.highBp ? "Oui" : "Non",
      "Cholestérol élevé": p.highChol ? "Oui" : "Non",
      "Activité physique": p.physActivity ? "Oui" : "Non",
      Fumeur: p.smoker ? "Oui" : "Non",
      "Santé générale": genHlthLabels[String(p.genHlth || "")] || "--",
      "Santé mentale":
        p.mentHlth !== undefined ? `${p.mentHlth} jour(s)` : "--",
      "Santé physique":
        p.physHlth !== undefined ? `${p.physHlth} jour(s)` : "--",
    };
  };

  const userName =
    predictions.length > 0
      ? `${predictions[0].userPrenom} ${predictions[0].userNom}`
      : `Utilisateur #${userId}`;

  const userEmail = predictions.length > 0 ? predictions[0].userEmail : "";

  const filteredPredictions = predictions.filter((prediction) => {

      const predictionDate = new Date(prediction.createdAt)
          .toISOString()
          .split("T")[0];

      if (startDate && predictionDate < startDate) {
          return false;
      }

      if (endDate && predictionDate > endDate) {
          return false;
      }

      return true;
  });

  const chartData = [...filteredPredictions]
  .sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  )
  .map((prediction) => ({
    date: formatDate(prediction.createdAt),
    score: Math.round(prediction.riskScore * 100),
  }));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPredictions = filteredPredictions.slice(
    startIndex,
    startIndex + rowsPerPage,
  );
  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage);

  if (loading)
    return <LoadingSpinner message="Chargement des prédictions..." />;

  return (
    <>
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <button
            className="btn btn-custom-text mb-3 d-flex align-items-center gap-1 ps-0"
            onClick={() => navigate("/admin/utilisateurs")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Retour aux utilisateurs
          </button>
          <div className="d-flex align-items-center gap-3">
            <div className="admin-user-avatar admin-user-avatar-lg">
              {userName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
            </div>
            <div>
              <h1 className="h2 mb-0 fw-bold">Prédictions de {userName}</h1>
              {userEmail && (
                <p className="text-secondary-custom mb-0 mt-1">
                  <span
                    className="material-symbols-outlined me-1"
                    style={{ fontSize: "16px", verticalAlign: "text-bottom" }}
                  >
                    mail
                  </span>
                  {userEmail}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <div className="d-inline-flex align-items-center gap-2 bg-surface-low rounded-3 p-3">
            <span className="material-symbols-outlined text-primary-custom">
              batch_prediction
            </span>
            <span className="fw-semibold">
              {predictions.length} prédiction(s)
            </span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Date Filter */}
      <div className="card border-0 shadow-sm-custom mb-4 rounded-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-medium">Date de début</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Date de fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm-custom mb-5 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light text-label-sm text-secondary-custom">
              <tr>
                <th className="py-3 px-4 fw-medium border-bottom-0">ID</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">
                  Date & Heure
                </th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Score</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">
                  Risque Prédit
                </th>
                <th className="py-3 px-4 fw-medium border-bottom-0">IMC</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">
                  Hypertension
                </th>
                <th className="py-3 px-4 fw-medium border-bottom-0 text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.length === 0 ? (
                <tr>
                  <td className="text-center py-5 text-secondary" colSpan={7}>
                    Aucune prédiction trouvée pour cet utilisateur.
                  </td>
                </tr>
              ) : (
                paginatedPredictions.map((p, idx) => {
                  const badge = riskBadges[p.riskLevel] || riskBadges.MODERATE;
                  return (
                    <tr
                      key={p.predictionId}
                      className={idx === 0 ? "table-row-highlight" : ""}
                    >
                      <td className="py-3 px-4 fw-medium text-secondary-custom">
                        #{p.predictionId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className={`material-symbols-outlined ${idx === 0 ? "text-primary-custom" : "text-secondary-custom"}`}
                          >
                            schedule
                          </span>
                          <div>
                            <div className="fw-medium">
                              {formatDate(p.createdAt)}
                            </div>
                            <div className="small text-secondary-custom">
                              {formatTime(p.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 fw-semibold">
                        {Math.round(p.riskScore * 100)}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge rounded-pill ${badge.cls} px-3 py-2 fw-medium`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">{p.bmi || "--"}</td>
                      <td className="py-3 px-4">
                        {p.highBp ? (
                          <span className="badge rounded-pill badge-error px-2 py-1">
                            Oui
                          </span>
                        ) : (
                          <span className="small text-secondary-custom">
                            Non
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          className="btn btn-link text-primary-custom p-1 rounded-circle"
                          title="Voir les détails"
                          onClick={() => handleView(p)}
                        >
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-surface-low border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="text-label-sm text-secondary-custom">
              Page {currentPage} sur {totalPages || 1}
            </span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm-custom rounded-3">

    <div className="card-body">

        <h4 className="fw-bold mb-4">
            Évolution du Score de Risque
        </h4>

        {chartData.length < 2 ? (

            <div className="text-center text-secondary py-5">
                Au moins deux prédictions sont nécessaires
                pour afficher l'évolution.
            </div>

        ) : (

            <ResponsiveContainer
                width="100%"
                height={350}
            >

                <LineChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />

                    <Tooltip
                        formatter={(value) => [`${value}%`, "Score"]}
                    />

                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#1D5CC8"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                    />

                </LineChart>

            </ResponsiveContainer>

        )}

    </div>

</div>

      {/* Modal */}
      {selectedPrediction && (
        <ResultModal
          show={showModal}
          onClose={() => setShowModal(false)}
          riskScore={selectedPrediction.riskScore}
          riskLevel={selectedPrediction.riskLevel}
          shapValues={selectedPrediction.shapValues}
          summaryData={buildSummaryData(selectedPrediction)}
        />
      )}
    </>
  );
}
