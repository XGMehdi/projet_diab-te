import { useEffect, useState } from "react";
import {
  getPredictions,
  deletePrediction,
  PredictionResponse,
} from "../../services/predictionService";
import ResultModal from "../../components/ui/ResultModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Historique() {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionResponse | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  // Fetch helper
  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getPredictions();
      setPredictions(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 👇 Add it here
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette prédiction ?"))
      return;
    try {
      await deletePrediction(id);
      setPredictions((prev) => prev.filter((p) => p.predictionId !== id));
      if (selectedPrediction?.predictionId === id) {
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const riskBadges: Record<string, { label: string; cls: string }> = {
    HIGH: { label: "Élevé", cls: "badge-error" },
    MODERATE: { label: "Modéré", cls: "badge-secondary-custom" },
    LOW: { label: "Faible", cls: "badge-tertiary" },
  };

  const handleView = (p: PredictionResponse) => {
    setSelectedPrediction(p);
    setShowModal(true);
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

  const handleDownloadPDF = (p: PredictionResponse) => {
    const doc = new jsPDF();
    const date = formatDate(p.createdAt);
    const time = formatTime(p.createdAt);

    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("Rapport de Prédiction Diabète", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date d'évaluation : ${date} à ${time}`, 14, 30);
    doc.text(`Identifiant : #${p.predictionId}`, 14, 37);

    doc.setFontSize(16);
    doc.setTextColor(20);
    doc.text("Résultat de l'Évaluation", 14, 50);

    const badge = riskBadges[p.riskLevel] || riskBadges.MODERATE;

    autoTable(doc, {
      startY: 55,
      head: [["Score de Risque", "Niveau de Risque"]],
      body: [[`${Math.round(p.riskScore * 100)}%`, badge.label]],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 12, halign: "center" },
    });

    doc.setFontSize(16);
    doc.text(
      "Caractéristiques du Patient",
      14,
      (doc as any).lastAutoTable.finalY + 15,
    );

    const summary = buildSummaryData(p);
    const tableData = Object.entries(summary).map(([key, value]) => [
      key,
      value,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Paramètre", "Valeur"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [52, 73, 94] },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        "Ce rapport est généré automatiquement et ne remplace pas un avis médical.",
        105,
        285,
        { align: "center" },
      );
    }

    const safeDate = date.replace(/\//g, "-").replace(/ /g, "_");
    doc.save(`prediction_${p.predictionId}_${safeDate}.pdf`);
  };

  // Build dynamic summary based on prediction fields
  const buildSummaryData = (p: PredictionResponse): Record<string, string> => {
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

  // Filter local items
  const filteredPredictions = predictions.filter((p) => {
    const predictionDate = new Date(p.createdAt).toISOString().split("T")[0];

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
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((prediction) => ({
      date: formatDate(prediction.createdAt),
      score: Math.round(prediction.riskScore * 100),
    }));

  // Use the filtered list to compute pagination
  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedPredictions = filteredPredictions.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage);

  if (loading && predictions.length === 0)
    return <LoadingSpinner message="Chargement de l'historique..." />;

  return (
    <>
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h1 mb-2">Historique des Prédictions</h1>

          <p className="fs-5 text-secondary-custom mb-0">
            Consultez et analysez les résultats des évaluations passées.
          </p>
        </div>

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
                  className="btn btn-primary-custom w-100"
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
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table */}
      <div className="card border-0 shadow-sm-custom mb-5 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light text-label-sm text-secondary-custom">
              <tr>
                <th className="py-3 px-4 fw-medium border-bottom-0">
                  Date &amp; Heure
                </th>
                <th className="py-3 px-4 fw-medium border-bottom-0">Score</th>
                <th className="py-3 px-4 fw-medium border-bottom-0">
                  Risque Prédit
                </th>
                <th className="py-3 px-4 fw-medium border-bottom-0 text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.length === 0 ? (
                <tr>
                  <td className="text-center py-5 text-secondary" colSpan={4}>
                    Aucune prédiction trouvée.
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
                      <td className="py-3 px-4 fw-medium">
                        {Math.round(p.riskScore * 100)}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge rounded-pill ${badge.cls} px-3 py-2 fw-medium`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-link text-success p-1 rounded-circle"
                            title="Télécharger PDF"
                            onClick={() => handleDownloadPDF(p)}
                          >
                            <span className="material-symbols-outlined">
                              picture_as_pdf
                            </span>
                          </button>
                          <button
                            className="btn btn-link text-primary-custom p-1 rounded-circle"
                            title="Voir les détails"
                            onClick={() => handleView(p)}
                          >
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
                          </button>
                          <button
                            className="btn btn-link text-danger p-1 rounded-circle"
                            title="Supprimer"
                            onClick={() => handleDelete(p.predictionId)}
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
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
            Page {currentPage} sur {totalPages || 1}
          </span>
          <div className="btn-group" role="group">
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

      <div className="card border-0 shadow-sm-custom rounded-3">
        <div className="card-body">
          <h4 className="fw-bold mb-4">Évolution du Score de Risque</h4>

          {chartData.length < 2 ? (
            <div className="text-center text-secondary py-5">
              Vous avez besoin d'au moins deux prédictions pour afficher
              l'évolution.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip formatter={(value) => [`${value}%`, "Score"]} />

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
    </>
  );
}
