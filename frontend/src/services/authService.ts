import api from "./api";

/*
====================================
TYPES
====================================
*/

export interface RegisterData {

    nom: string;

    prenom: string;

    dateNaissance: string;

    email: string;

    password: string;
}

export interface LoginData {

    email: string;

    password: string;
}

export interface AuthResponse {

    token: string;
}

export interface User {

    id: number;

    nom: string;

    prenom: string;

    email: string;

    role?: string;
}

/*
====================================
REGISTER
====================================
*/

export const register = async (

    data: RegisterData

) => {

    const response = await api.post(

        "/auth/register",

        data
    );

    return response.data;
};

/*
====================================
LOGIN
====================================
*/

export const login = async (

    data: LoginData

): Promise<AuthResponse> => {

    const response = await api.post(

        "/auth/login",

        data
    );

    return response.data;
};

/*
====================================
GET AUTHENTICATED USER
====================================
*/

export const getMe = async (

): Promise<User> => {

    const response = await api.get(

        "/auth/me"
    );

    return response.data;
};

/*
====================================
FORGOT PASSWORD
====================================
*/

export const forgotPassword = async (

    email: string

) => {

    const response = await api.post(

        "/auth/forgot-password",

        { email }
    );

    return response.data;
};

/*
====================================
RESET PASSWORD
====================================
*/

export const resetPassword = async (

    token: string,

    newPassword: string

) => {

    const response = await api.post(

        "/auth/reset-password",

        { token, newPassword }
    );

    return response.data;
};