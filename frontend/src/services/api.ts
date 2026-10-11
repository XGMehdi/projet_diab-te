import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/* ====================================
   AXIOS INSTANCE
   ==================================== */

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ====================================
   ADD JWT TOKEN AUTOMATICALLY
   ==================================== */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ====================================
   MOCK API SYSTEM (Testing without backend)
   ==================================== */

// Set this to true to test ONLY the frontend using mock data in LocalStorage.
// Change to false to connect to the actual Spring Boot backend at http://localhost:8080/api.
export const USE_MOCK = false; // Liaison avec le backend activée

if (USE_MOCK) {
  console.log('⚠️ Running in MOCK mode. Frontend is simulated.');

  // Initialize mock LocalStorage database if empty
  const initMockDb = () => {
    if (!localStorage.getItem('mock_user')) {
      localStorage.setItem(
        'mock_user',
        JSON.stringify({
          id: 1,
          nom: 'Elkasraoui',
          prenom: 'Soufiane',
          email: 'soufiane@gmail.com',
          dateNaissance: '2004-08-15',
        })
      );
    }

    if (!localStorage.getItem('mock_predictions')) {
      const defaultPredictions = [
        {
          predictionId: 1,
          riskScore: 0.82,
          riskLevel: 'HIGH',
          shapValues: { bmi: 0.32, genHlth: 0.21, physActivity: -0.15, age: 0.12, highBp: 0.1, highChol: 0.08 },
          createdAt: '2026-06-12T14:30:00',
          highBp: true,
          highChol: true,
          cholCheck: true,
          bmi: 31.2,
          smoker: false,
          stroke: false,
          heartDiseaseOrAttack: false,
          physActivity: false,
          fruits: true,
          veggies: true,
          hvyAlcoholConsump: false,
          genHlth: 4,
          mentHlth: 4,
          physHlth: 7,
          diffWalk: false,
          sex: 'MALE',
          age: 8,
        },
        {
          predictionId: 2,
          riskScore: 0.14,
          riskLevel: 'LOW',
          shapValues: { bmi: 0.05, genHlth: 0.03, physActivity: -0.08 },
          createdAt: '2026-06-11T09:15:00',
          highBp: false,
          highChol: false,
          cholCheck: true,
          bmi: 22.1,
          smoker: false,
          stroke: false,
          heartDiseaseOrAttack: false,
          physActivity: true,
          fruits: true,
          veggies: true,
          hvyAlcoholConsump: false,
          genHlth: 1,
          mentHlth: 0,
          physHlth: 0,
          diffWalk: false,
          sex: 'FEMALE',
          age: 2,
        },
        {
          predictionId: 3,
          riskScore: 0.45,
          riskLevel: 'MODERATE',
          shapValues: { bmi: 0.18, genHlth: 0.12, physActivity: -0.1, age: 0.08 },
          createdAt: '2026-06-10T16:45:00',
          highBp: true,
          highChol: false,
          cholCheck: true,
          bmi: 26.5,
          smoker: true,
          stroke: false,
          heartDiseaseOrAttack: false,
          physActivity: true,
          fruits: false,
          veggies: true,
          hvyAlcoholConsump: false,
          genHlth: 3,
          mentHlth: 2,
          physHlth: 3,
          diffWalk: false,
          sex: 'MALE',
          age: 5,
        },
      ];
      localStorage.setItem('mock_predictions', JSON.stringify(defaultPredictions));
    }
  };

  initMockDb();

  // Custom Axios Adapter to intercept and mock calls
  api.defaults.adapter = async (config: any): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    let data = null;
    if (config.data) {
      try {
        data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      } catch (e) {
        data = config.data;
      }
    }

    const getUser = () => JSON.parse(localStorage.getItem('mock_user') || '{}');
    const getPreds = () => JSON.parse(localStorage.getItem('mock_predictions') || '[]');
    const savePreds = (preds: any) => localStorage.setItem('mock_predictions', JSON.stringify(preds));

    // Route matching
    // 1. Auth routes
    if (url.includes('/auth/register')) {
      localStorage.setItem('mock_user', JSON.stringify({ ...data, id: Date.now() }));
      return {
        data: { message: 'Utilisateur créé avec succès' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.includes('/auth/login')) {
      const user = getUser();
      localStorage.setItem('token', 'mock_jwt_token_for_testing');
      return {
        data: {
          token: 'mock_jwt_token_for_testing',
          user: { id: user.id || 1, nom: user.nom || 'Elkasraoui', prenom: user.prenom || 'Soufiane', email: data?.email || user.email || 'user@test.com' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.includes('/auth/me')) {
      const user = getUser();
      return {
        data: user,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 2. User Profile routes
    if (url.includes('/users/profile')) {
      const user = getUser();
      if (method === 'put') {
        const updated = { ...user, ...data };
        localStorage.setItem('mock_user', JSON.stringify(updated));
        return {
          data: updated,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }
      return {
        data: user,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.includes('/users/change-password')) {
      return {
        data: { message: 'Mot de passe mis à jour' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 3. Prediction routes
    if (url.includes('/predictions')) {
      const preds = getPreds();

      // Get specific prediction
      const idMatch = url.match(/\/predictions\/(\d+)/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        if (method === 'delete') {
          const filtered = preds.filter((p: any) => p.predictionId !== id);
          savePreds(filtered);
          return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
        }
        const pred = preds.find((p: any) => p.predictionId === id);
        return { data: pred, status: 200, statusText: 'OK', headers: {}, config };
      }

      // Create new prediction
      if (method === 'post') {
        // Run simple heuristic algorithm to calculate risk score
        let riskScore = 0.1; // Base
        if (data.highBp) riskScore += 0.22;
        if (data.highChol) riskScore += 0.18;
        if (data.bmi > 25) riskScore += (data.bmi - 25) * 0.015;
        if (data.smoker) riskScore += 0.05;
        if (data.stroke) riskScore += 0.15;
        if (data.heartDiseaseOrAttack) riskScore += 0.2;
        if (!data.physActivity) riskScore += 0.1;
        if (data.genHlth) riskScore += (data.genHlth - 1) * 0.08;
        if (data.age) riskScore += data.age * 0.03;
        if (data.diffWalk) riskScore += 0.07;

        riskScore = Math.max(0.05, Math.min(0.95, riskScore));
        let riskLevel = 'LOW';
        if (riskScore >= 0.6) riskLevel = 'HIGH';
        else if (riskScore >= 0.35) riskLevel = 'MODERATE';

        // Dynamic SHAP values based on inputs
        const shapValues: Record<string, number> = {};
        if (data.highBp) shapValues.highBp = 0.22;
        if (data.highChol) shapValues.highChol = 0.18;
        if (data.bmi > 25) shapValues.bmi = parseFloat(((data.bmi - 25) * 0.015).toFixed(2));
        if (!data.physActivity) shapValues.physActivity = -0.11;
        if (data.genHlth > 2) shapValues.genHlth = parseFloat(((data.genHlth - 1) * 0.08).toFixed(2));
        if (data.age > 4) shapValues.age = parseFloat(((data.age - 4) * 0.03).toFixed(2));

        const newPred = {
          ...data,
          predictionId: preds.length ? Math.max(...preds.map((p: any) => p.predictionId)) + 1 : 1,
          riskScore: parseFloat(riskScore.toFixed(2)),
          riskLevel,
          shapValues,
          createdAt: new Date().toISOString(),
        };

        preds.unshift(newPred);
        savePreds(preds);

        return {
          data: newPred,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Get all predictions
      return {
        data: preds,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 4. Dashboard routes
    if (url.includes('/dashboard/stats')) {
      const preds = getPreds();
      const total = preds.length;
      const high = preds.filter((p: any) => p.riskLevel === 'HIGH').length;
      const moderate = preds.filter((p: any) => p.riskLevel === 'MODERATE').length;
      const low = preds.filter((p: any) => p.riskLevel === 'LOW').length;
      const avg = total ? preds.reduce((acc: number, p: any) => acc + p.riskScore, 0) / total : 0;

      return {
        data: {
          totalPredictions: total,
          highRiskCount: high,
          moderateRiskCount: moderate,
          lowRiskCount: low,
          averageRiskScore: parseFloat(avg.toFixed(2)),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.includes('/dashboard/risk-distribution')) {
      const preds = getPreds();
      const high = preds.filter((p: any) => p.riskLevel === 'HIGH').length;
      const moderate = preds.filter((p: any) => p.riskLevel === 'MODERATE').length;
      const low = preds.filter((p: any) => p.riskLevel === 'LOW').length;

      return {
        data: { low, moderate, high },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.includes('/dashboard/monthly-predictions')) {
      return {
        data: [
          { month: 'Jan', count: 2 },
          { month: 'Feb', count: 5 },
          { month: 'Mar', count: 3 },
          { month: 'Apr', count: 6 },
          { month: 'Mai', count: 8 },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    return Promise.reject(new Error(`404: Endpoint mock non trouvé (${url})`));
  };
}

export default api;