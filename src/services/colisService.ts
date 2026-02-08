import { apiClient } from './api';
import {
    Colis,
    CreateColisData,
    UpdateColisData,
    UpdateColisStatusData,
    PageResponse,
    ColisStatistics,
    HistoriqueLivraison,
    ColisPriorite,
} from '../types';

export const colisService = {
    /**
     * Get all colis (filtered by authenticated user role on backend)
     * - MANAGER: all colis
     * - LIVREUR: only their assigned colis
     * - CLIENT: only their colis
     */
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

    /**
     * Get statistics (filtered by authenticated user role on backend)
     */
    async getStatistics(): Promise<ColisStatistics> {
        return await apiClient.get<ColisStatistics>('/colis/statistiques');
    },

    /**
     * Get overdue colis (filtered by authenticated user role on backend)
     */
    async getOverdue(): Promise<Colis[]> {
        return await apiClient.get<Colis[]>('/colis/en-retard');
    },

    /**
     * Get colis by priority (filtered by authenticated user role on backend)
     */
    async getByPriorite(
        priorite: ColisPriorite,
        params?: { page?: number; size?: number }
    ): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());

        return await apiClient.get<PageResponse<Colis>>(
            `/colis/priorite/${priorite}?${queryParams.toString()}`
        );
    },

    async getHistory(colisId: string): Promise<HistoriqueLivraison[]> {
        return await apiClient.get<HistoriqueLivraison[]>(`/historiques/colis/${colisId}`);
    },

    /**
     * Get delivery history for a colis
     */
    async getHistorique(colisId: string): Promise<HistoriqueLivraison[]> {
        return await apiClient.get<HistoriqueLivraison[]>(`/colis/${colisId}/historique`);
    },

    /**
     * Filter colis by status
     */
    async getByStatut(statut: string, params?: { page?: number; size?: number }): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Colis>>(`/colis/statut/${statut}?${queryParams.toString()}`);
    },

    /**
     * Get colis by client expediteur
     */
    async getByClient(clientId: string, params?: { page?: number; size?: number }): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Colis>>(`/colis/client/${clientId}?${queryParams.toString()}`);
    },

    /**
     * Get colis by livreur
     */
    async getByLivreur(livreurId: string, params?: { page?: number; size?: number }): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Colis>>(`/colis/livreur/${livreurId}?${queryParams.toString()}`);
    },

    /**
     * Search colis
     */
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
};