import api from './api';

/* ====================================
   TYPES
   ==================================== */

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance?: string;
}

export interface UpdateProfileData {
  nom: string;
  prenom: string;
  dateNaissance: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/* ====================================
   GET PROFILE
   ==================================== */

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/auth/me'); // Changed to /auth/me
  return response.data;
};

/* ====================================
   UPDATE PROFILE
   ==================================== */

export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<UserProfile> => {
  const response = await api.put('/profile/update', data); // Changed to /profile/update
  return response.data;
};

/* ====================================
   CHANGE PASSWORD
   ==================================== */

export const changePassword = async (
  data: ChangePasswordData
): Promise<void> => {
  await api.put('/profile/change-password', data); // Changed to /profile/change-password
};
