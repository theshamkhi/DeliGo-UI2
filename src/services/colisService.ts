import { apiClient } from './api';
import {
    Colis,
    CreateColisData,
    UpdateColisData,
    UpdateColisStatusData,
    PageResponse,
    ColisStatistics,
    HistoriqueLivraison,
} from '../types';

export const colisService = {
    async getAll(params?: {
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        return await apiClient.get<PageResponse<Colis>>(
            `/colis?${queryParams.toString()}`
        );
    },

    async getById(id: string): Promise<Colis> {
        return await apiClient.get<Colis>(`/colis/${id}`);
    },

    async search(params: {
        keyword: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        queryParams.append('keyword', params.keyword);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());

        return await apiClient.get<PageResponse<Colis>>(
            `/colis/search?${queryParams.toString()}`
        );
    },

    async create(data: CreateColisData): Promise<Colis> {
        return await apiClient.post<Colis>('/colis', data);
    },

    async update(id: string, data: UpdateColisData): Promise<Colis> {
        return await apiClient.put<Colis>(`/colis/${id}`, data);
    },

    async updateStatus(id: string, data: UpdateColisStatusData): Promise<Colis> {
        return await apiClient.patch<Colis>(`/colis/${id}/statut`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/colis/${id}`);
    },

    async getStatistics(): Promise<ColisStatistics> {
        return await apiClient.get<ColisStatistics>('/colis/statistiques');
    },

    async getHistory(colisId: string): Promise<HistoriqueLivraison[]> {
        return await apiClient.get<HistoriqueLivraison[]>(`/historiques/colis/${colisId}`);
    },
};