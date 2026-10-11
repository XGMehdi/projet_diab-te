interface ResultModalProps {
  show: boolean;
  onClose: () => void;
  riskScore: number;
  riskLevel: string;
  shapValues: Record<string, number>;
  summaryData: Record<string, string>;
  onSave?: () => void;
  onViewHistory?: () => void;
}

/**
 * Result modal showing prediction results with circular progress,
 * risk factors (SHAP values), and data summary.
 */
export default function ResultModal({
  show,
  onClose,
  riskScore,
  riskLevel,
  shapValues,
  summaryData,
  onSave,
  onViewHistory,
}: ResultModalProps) {
  if (!show) return null;

  const scorePercent = Math.round(riskScore * 100);
  const strokeDasharray = `${scorePercent}, 100`;

  const riskLabels: Record<string, { label: string; className: string; description: string }> = {
    HIGH: {
      label: 'Risque élevé',
      className: 'high',
      description: 'Votre risque est élevé. Consultez un professionnel de santé pour un suivi personnalisé.',
    },
    MODERATE: {
      label: 'Risque moyen',
      className: '',
      description:
        'Votre risque est modéré. Une attention particulière à votre alimentation et à votre activité physique est recommandée.',
    },
    LOW: {
      label: 'Risque faible',
      className: 'low',
      description: 'Votre risque est faible. Continuez à maintenir un mode de vie sain.',
    },
  };

  const risk = riskLabels[riskLevel] || riskLabels.MODERATE;

  // Factor name mappings
  const factorNames: Record<string, string> = {
    bmi: 'BMI élevé',
    highBp: 'Hypertension',
    highChol: 'Cholestérol élevé',
    genHlth: 'Mauvaise santé générale',
    physActivity: 'Activité physique',
    age: 'Âge avancé',
    diffWalk: 'Difficulté à marcher',
    heartDiseaseOrAttack: 'Maladie cardiaque',
    stroke: 'Antécédent d\'AVC',
    smoker: 'Fumeur',
    fruits: 'Consommation de fruits',
    veggies: 'Consommation de légumes',
    hvyAlcoholConsump: 'Consommation d\'alcool',
    mentHlth: 'Santé mentale',
    physHlth: 'Santé physique',
    cholCheck: 'Contrôle cholestérol',
    sex: 'Sexe',
  };

  // Sort SHAP values by absolute value, take top 6
  const sortedFactors = Object.entries(shapValues)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 6);

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <span className="material-symbols-outlined text-primary">monitoring</span>
                Résultat de votre analyse
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Score */}
              <div className="score-container">
                <div className="progress-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e9ecef"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--tertiary)"
                      strokeDasharray={strokeDasharray}
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="value">{scorePercent}%</span>
                </div>

                <span className={`badge-risk ${risk.className}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                    warning
                  </span>
                  {risk.label}
                </span>

                <p className="risk-text">{risk.description}</p>
              </div>

              <div className="row g-4">
                {/* Influence factors */}
                <div className="col-md-6">
                  <div className="detail-card">
                    <div className="detail-card-title">Facteurs d'influence principaux</div>
                    {sortedFactors.map(([key, value]) => (
                      <div className="factor-row" key={key}>
                        <div className="factor-header">
                          <span>{factorNames[key] || key}</span>
                          <span className="factor-value">
                            {value >= 0 ? '+' : ''}
                            {Math.round(Math.abs(value) * 100)}%
                          </span>
                        </div>
                        <div className="progress-custom">
                          <div
                            className="progress-custom-bar"
                            style={{ width: `${Math.min(Math.abs(value) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data summary */}
                <div className="col-md-6">
                  <div className="detail-card">
                    <div className="detail-card-title">Résumé des données</div>
                    <ul className="summary-list">
                      {Object.entries(summaryData).map(([label, value]) => (
                        <li className="summary-item" key={label}>
                          <span className="text-secondary">{label}</span>
                          <span className="fw-bold text-dark">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer justify-content-between">
              <button className="btn-custom-text" type="button" onClick={onClose}>
                Fermer
              </button>
              <div className="d-flex gap-2 flex-wrap">
                {onViewHistory && (
                  <button className="btn-custom-outline" type="button" onClick={onViewHistory}>
                    <span className="material-symbols-outlined">history</span>
                    Voir l'historique
                  </button>
                )}
                {onSave && (
                  <button className="btn-custom-primary" type="button" onClick={onSave}>
                    <span className="material-symbols-outlined">save</span>
                    Enregistrer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
