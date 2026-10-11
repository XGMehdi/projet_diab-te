import api from './api';

/* ====================================
   TYPES
   ==================================== */

export interface PredictionRequest {
  highBp: boolean;
  highChol: boolean;
  cholCheck: boolean;
  bmi: number;
  smoker: boolean;
  stroke: boolean;
  heartDiseaseOrAttack: boolean;
  physActivity: boolean;
  fruits: boolean;
  veggies: boolean;
  hvyAlcoholConsump: boolean;
  genHlth: number;
  mentHlth: number;
  physHlth: number;
  diffWalk: boolean;
  sex: string;
  age: number;
}

export interface PredictionResponse {
  predictionId: number;
  riskScore: number;
  riskLevel: string;
  shapValues: Record<string, number>;
  createdAt: string;
  // Input data echoed back
  highBp?: boolean;
  highChol?: boolean;
  cholCheck?: boolean;
  bmi?: number;
  smoker?: boolean;
  stroke?: boolean;
  heartDiseaseOrAttack?: boolean;
  physActivity?: boolean;
  fruits?: boolean;
  veggies?: boolean;
  hvyAlcoholConsump?: boolean;
  genHlth?: number;
  mentHlth?: number;
  physHlth?: number;
  diffWalk?: boolean;
  sex?: string;
  age?: number;
}

/* ====================================
   CREATE PREDICTION
   ==================================== */

export const createPrediction = async (
  data: PredictionRequest
): Promise<PredictionResponse> => {
  const response = await api.post('/predictions', data);
  return response.data;
};

/* ====================================
   GET ALL PREDICTIONS (HISTORY)
   ==================================== */

export const getPredictions = async (
  page: number = 0,
  size: number = 10
): Promise<PredictionResponse[]> => {
  const response = await api.get('/predictions', {
    params: { page, size, sort: 'createdAt,desc' },
  });
  return response.data;
};

/* ====================================
   GET PREDICTION BY ID
   ==================================== */

export const getPredictionById = async (
  id: number
): Promise<PredictionResponse> => {
  const response = await api.get(`/predictions/${id}`);
  return response.data;
};

/* ====================================
   DELETE PREDICTION
   ==================================== */

export const deletePrediction = async (
  id: number
): Promise<void> => {
  // Not implemented on backend currently, simulate success
  return Promise.resolve();
};
