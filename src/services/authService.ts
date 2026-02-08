import { apiClient } from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

        // Store tokens and user data
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify({
            id: response.id,
            username: response.username,
            email: response.email,
            nom: response.nom,
            prenom: response.prenom,
            roles: response.roles,
            permissions: response.permissions,
            livreurId: response.livreurId,
            clientExpediteurId: response.clientExpediteurId,
        }));

        return response;
    },

    /**
     * Unified registration for ALL user types
     * Use this to create MANAGER, LIVREUR, or CLIENT users
     * Backend automatically creates and links business entities based on roles
     */
    async register(data: RegisterData): Promise<User> {
        return await apiClient.post<User>('/auth/register', data);
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    async getProfile(): Promise<User> {
        return await apiClient.get<User>('/auth/profile');
    },

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        return await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    },

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
};