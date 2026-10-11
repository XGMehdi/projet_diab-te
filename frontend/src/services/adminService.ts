import api from './api';

/* ====================================
   TYPES
   ==================================== */

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance?: string;
  role: string;
  createdAt: string;
  totalPredictions: number;
  latestRiskScore?: number;
  latestRiskLevel?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  newUsersThisMonth: number;
  predictionsThisMonth: number;
}

export interface AdminPrediction {
  predictionId: number;
  userId: number;
  userNom: string;
  userPrenom: string;
  userEmail: string;
  riskScore: number;
  riskLevel: string;
  shapValues: Record<string, number>;
  createdAt: string;
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
   GET ALL USERS
   ==================================== */

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get('/admin/users');
  return response.data;
};

/* ====================================
   DELETE USER
   ==================================== */

export const deleteAdminUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

/* ====================================
   GET USER PREDICTIONS
   ==================================== */

export const getAdminUserPredictions = async (
  userId: number
): Promise<AdminPrediction[]> => {
  const response = await api.get(`/admin/users/${userId}/predictions`);
  return response.data;
};

/* ====================================
   GET ADMIN STATISTICS
   ==================================== */

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};
