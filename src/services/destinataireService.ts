import { apiClient } from './api';
import {
    Destinataire,
    CreateDestinataireData,
    PageResponse,
} from '../types';

export const destinataireService = {
    async getAll(params?: { page?: number; size?: number }): Promise<PageResponse<Destinataire>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Destinataire>>(`/destinataires?${queryParams.toString()}`);
    },

    async getById(id: string): Promise<Destinataire> {
        return await apiClient.get<Destinataire>(`/destinataires/${id}`);
    },

    async create(data: CreateDestinataireData): Promise<Destinataire> {
        return await apiClient.post<Destinataire>('/destinataires', data);
    },

    async update(id: string, data: CreateDestinataireData): Promise<Destinataire> {
        return await apiClient.put<Destinataire>(`/destinataires/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/destinataires/${id}`);
    },
};