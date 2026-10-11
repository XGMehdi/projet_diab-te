import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultModal from '../../components/ui/ResultModal';
import { createPrediction, PredictionRequest } from '../../services/predictionService';

export default function Prediction() {
  const navigate = useNavigate();
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [bmi, setBmi] = useState('');
  const [highBp, setHighBp] = useState(false);
  const [highChol, setHighChol] = useState(false);
  const [cholCheck, setCholCheck] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [diffWalk, setDiffWalk] = useState(false);
  const [physActivity, setPhysActivity] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [fruits, setFruits] = useState(false);
  const [veggies, setVeggies] = useState(false);
  const [hvyAlcohol, setHvyAlcohol] = useState(false);
  const [genHlth, setGenHlth] = useState('');
  const [mentHlth, setMentHlth] = useState('');
  const [physHlth, setPhysHlth] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ riskScore: number; riskLevel: string; shapValues: Record<string, number> } | null>(null);

  const ageLabels: Record<string, string> = { '1':'18-24','2':'25-29','3':'30-34','4':'35-39','5':'40-44','6':'45-49','7':'50-54','8':'55-59','9':'60-64','10':'65-69','11':'70-74','12':'75-79','13':'80+' };
  const genHlthLabels: Record<string, string> = { '1':'Excellent','2':'Très bon','3':'Bon','4':'Moyen','5':'Mauvais' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload: PredictionRequest = { highBp, highChol, cholCheck, bmi: parseFloat(bmi), smoker, stroke, heartDiseaseOrAttack: heartDisease, physActivity, fruits, veggies, hvyAlcoholConsump: hvyAlcohol, genHlth: parseInt(genHlth), mentHlth: parseInt(mentHlth), physHlth: parseInt(physHlth), diffWalk, sex: sex === '1' ? 'MALE' : 'FEMALE', age: parseInt(age) };
      const data = await createPrediction(payload);
      setResult({ riskScore: data.riskScore, riskLevel: data.riskLevel, shapValues: data.shapValues });
      setShowModal(true);
    } catch (err: any) { console.error(err); setError('Erreur lors de la prédiction.'); } finally { setLoading(false); }
  };

  const summaryData: Record<string, string> = { 'Âge': ageLabels[age]||'-', 'Sexe': sex==='1'?'Homme':'Femme', 'BMI': bmi||'-', 'Hypertension': highBp?'Oui':'Non', 'Cholestérol': highChol?'Oui':'Non', 'Activité physique': physActivity?'Oui':'Non', 'Santé générale': genHlthLabels[genHlth]||'-' };

  const switchItems = [
    { id:'highbp',label:'Hypertension artérielle',v:highBp,s:setHighBp },
    { id:'highchol',label:'Cholestérol élevé',v:highChol,s:setHighChol },
    { id:'heartdisease',label:'Maladie cardiaque / Infarctus',v:heartDisease,s:setHeartDisease },
    { id:'stroke',label:"Antécédent d'AVC",v:stroke,s:setStroke },
  ];

  const lifestyleItems = [
    { id:'physactivity',label:'Activité physique (30 derniers jours)',v:physActivity,s:setPhysActivity },
    { id:'smoker',label:'Fumeur (au moins 100 cigarettes à vie)',v:smoker,s:setSmoker },
    { id:'fruits',label:'Consommation de fruits quotidienne',v:fruits,s:setFruits },
    { id:'veggies',label:'Consommation de légumes quotidienne',v:veggies,s:setVeggies },
  ];

  return (
    <>
      <div className="row justify-content-center">
        <div className="col-lg-11 col-xl-10">
          <div className="text-center mb-5">
            <h1 className="h2 fw-bold">Nouvelle prédiction</h1>
            <p className="text-secondary">Saisissez vos données de santé pour évaluer votre risque de diabète</p>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="card custom-card"><div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span className="material-symbols-outlined card-header-icon" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                <h2 className="card-title mb-0 h5 fw-semibold">Informations personnelles</h2>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="pred-age">Tranche d'âge</label>
                  <select className="form-select" id="pred-age" required value={age} onChange={e=>setAge(e.target.value)}>
                    <option disabled value="">Sélectionnez</option>
                    {Object.entries(ageLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label d-block mb-3">Sexe</label>
                  <div className="d-flex gap-4">
                    <div className="form-check"><input className="form-check-input" id="sex_m" name="sex" required type="radio" value="1" checked={sex==='1'} onChange={e=>setSex(e.target.value)}/><label className="form-check-label" htmlFor="sex_m">Homme</label></div>
                    <div className="form-check"><input className="form-check-input" id="sex_f" name="sex" type="radio" value="0" checked={sex==='0'} onChange={e=>setSex(e.target.value)}/><label className="form-check-label" htmlFor="sex_f">Femme</label></div>
                  </div>
                </div>
              </div>
            </div></div>

            {/* Physical Health */}
            <div className="card custom-card"><div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span className="material-symbols-outlined card-header-icon" style={{fontVariationSettings:"'FILL' 1"}}>monitor_heart</span>
                <h2 className="card-title mb-0 h5 fw-semibold">Santé physique</h2>
              </div>
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label" htmlFor="pred-bmi">IMC</label>
                  <input className="form-control" id="pred-bmi" placeholder="Ex: 24.5" required step="0.1" type="number" value={bmi} onChange={e=>setBmi(e.target.value)}/>
                </div>
                {switchItems.map(i=>(
                  <div className="col-md-6" key={i.id}><div className="form-check form-switch d-flex justify-content-between align-items-center border rounded p-3">
                    <label className="form-check-label fw-medium" htmlFor={i.id}>{i.label}</label>
                    <input className="form-check-input" id={i.id} type="checkbox" checked={i.v} onChange={e=>i.s(e.target.checked)}/>
                  </div></div>
                ))}
                <div className="col-md-12"><div className="form-check form-switch d-flex justify-content-between align-items-center border rounded p-3">
                  <label className="form-check-label fw-medium" htmlFor="diffwalk">Difficultés à marcher</label>
                  <input className="form-check-input" id="diffwalk" type="checkbox" checked={diffWalk} onChange={e=>setDiffWalk(e.target.checked)}/>
                </div></div>
              </div>
            </div></div>

            {/* Lifestyle */}
            <div className="card custom-card"><div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span className="material-symbols-outlined card-header-icon" style={{fontVariationSettings:"'FILL' 1"}}>fitness_center</span>
                <h2 className="card-title mb-0 h5 fw-semibold">Mode de vie</h2>
              </div>
              <div className="row g-3">
                {lifestyleItems.map(i=>(
                  <div className="col-md-6" key={i.id}><div className="form-check form-switch d-flex justify-content-between align-items-center border rounded p-3">
                    <label className="form-check-label fw-medium" htmlFor={i.id}>{i.label}</label>
                    <input className="form-check-input" id={i.id} type="checkbox" checked={i.v} onChange={e=>i.s(e.target.checked)}/>
                  </div></div>
                ))}
                <div className="col-12"><div className="form-check form-switch d-flex justify-content-between align-items-center border rounded p-3">
                  <label className="form-check-label fw-medium" htmlFor="hvyalcohol">Consommation excessive d'alcool</label>
                  <input className="form-check-input" id="hvyalcohol" type="checkbox" checked={hvyAlcohol} onChange={e=>setHvyAlcohol(e.target.checked)}/>
                </div></div>
              </div>
            </div></div>

            {/* General Health */}
            <div className="card custom-card"><div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span className="material-symbols-outlined card-header-icon" style={{fontVariationSettings:"'FILL' 1"}}>medical_services</span>
                <h2 className="card-title mb-0 h5 fw-semibold">Santé générale</h2>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="genhlth">Perception de votre santé</label>
                  <select className="form-select" id="genhlth" required value={genHlth} onChange={e=>setGenHlth(e.target.value)}>
                    <option disabled value="">Évaluez votre santé</option>
                    {Object.entries(genHlthLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-6"><div className="form-check form-switch d-flex justify-content-between align-items-center border rounded p-3 mt-md-4">
                  <label className="form-check-label fw-medium" htmlFor="cholcheck">Contrôle cholestérol (5 ans)</label>
                  <input className="form-check-input" id="cholcheck" type="checkbox" checked={cholCheck} onChange={e=>setCholCheck(e.target.checked)}/>
                </div></div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="menthlth">Santé mentale (jours)</label>
                  <input className="form-control" id="menthlth" max="30" min="0" placeholder="0-30" required type="number" value={mentHlth} onChange={e=>setMentHlth(e.target.value)}/>
                  <div className="form-text">Jours de mauvaise santé mentale</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="physhlth">Santé physique (jours)</label>
                  <input className="form-control" id="physhlth" max="30" min="0" placeholder="0-30" required type="number" value={physHlth} onChange={e=>setPhysHlth(e.target.value)}/>
                  <div className="form-text">Jours de maladie/blessure physique</div>
                </div>
              </div>
            </div></div>

            {error && <div className="alert alert-danger">{error}</div>}
            <div className="text-center mt-5 mb-5">
              <button className="btn btn-primary btn-lg px-5" type="submit" disabled={loading}>
                {loading ? 'Calcul en cours...' : 'Calculer le risque'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {result && <ResultModal show={showModal} onClose={()=>setShowModal(false)} riskScore={result.riskScore} riskLevel={result.riskLevel} shapValues={result.shapValues} summaryData={summaryData} onViewHistory={()=>{setShowModal(false);navigate('/historique');}}/>}
    </>
  );
}
