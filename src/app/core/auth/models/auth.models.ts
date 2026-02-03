export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}

export interface AuthResponse {
    status: string;
    accessToken?: string;
    userId: string;
    email: string;
    fullName: string;
    userType: 'new_investor' | 'existing_investor';
    authProvider?: 'LOCAL' | 'GOOGLE';
    createdAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    type: 'new_investor' | 'existing_investor';
    authProvider?: 'LOCAL' | 'GOOGLE';
}
