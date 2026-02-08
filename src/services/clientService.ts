import { apiClient } from './api';
import {
    Client,
    ClientCreationData,
    Destinataire,
    PageResponse,
} from '../types';

export const clientService = {
    async getAll(params?: { page?: number; size?: number }): Promise<PageResponse<Client>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Client>>(`/clients?${queryParams.toString()}`);
    },

    async getById(id: string): Promise<Client> {
        return await apiClient.get<Client>(`/clients/${id}`);
    },

    async search(params: { keyword: string; page?: number; size?: number }): Promise<PageResponse<Client>> {
        const queryParams = new URLSearchParams();
        queryParams.append('keyword', params.keyword);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Client>>(`/clients/search?${queryParams.toString()}`);
    },

    async create(data: ClientCreationData): Promise<Client> {
        return await apiClient.post<Client>('/clients', data);
    },

    async update(id: string, data: ClientCreationData): Promise<Client> {
        return await apiClient.put<Client>(`/clients/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/clients/${id}`);
    },

    // ============================================
    // NEW: Get destinataires for a client
    // ============================================

    /**
     * Get all destinataires associated with a specific client
     */
    async getDestinataires(
        clientId: string,
        params?: { page?: number; size?: number }
    ): Promise<PageResponse<Destinataire>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());

        return await apiClient.get<PageResponse<Destinataire>>(
            `/clients/${clientId}/destinataires?${queryParams.toString()}`
        );
    },
};