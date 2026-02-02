import { apiClient } from './api';
import {
    Client,
    CreateClientData,
    PageResponse,
} from '../types';

// Client Service
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

    async create(data: CreateClientData): Promise<Client> {
        return await apiClient.post<Client>('/clients', data);
    },

    async update(id: string, data: CreateClientData): Promise<Client> {
        return await apiClient.put<Client>(`/clients/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/clients/${id}`);
    },
};