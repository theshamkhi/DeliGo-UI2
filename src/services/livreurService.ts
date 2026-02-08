import { LivreurCreationData, Livreur, PageResponse, Colis, UpdateColisStatusData } from "../types";
import { apiClient } from "./api";

export const livreurService = {
    async getAll(params?: { page?: number; size?: number }): Promise<PageResponse<Livreur>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Livreur>>(`/livreurs?${queryParams.toString()}`);
    },

    async getActifs(): Promise<Livreur[]> {
        return await apiClient.get<Livreur[]>('/livreurs/actifs');
    },

    async getById(id: string): Promise<Livreur> {
        return await apiClient.get<Livreur>(`/livreurs/${id}`);
    },

    async create(data: LivreurCreationData): Promise<Livreur> {
        return await apiClient.post<Livreur>('/livreurs', data);
    },

    async update(id: string, data: LivreurCreationData): Promise<Livreur> {
        return await apiClient.put<Livreur>(`/livreurs/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/livreurs/${id}`);
    },

    // ============================================
    // NEW: Tournee management methods
    // ============================================

    /**
     * Get all colis assigned to a specific livreur (their tournee)
     */
    async getColis(
        livreurId: string,
        params?: { page?: number; size?: number }
    ): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());

        return await apiClient.get<PageResponse<Colis>>(
            `/livreurs/${livreurId}/colis?${queryParams.toString()}`
        );
    },

    /**
     * Update the status of a colis assigned to this livreur
     * This is a specialized endpoint for livreurs to update their own deliveries
     */
    async updateColisStatus(
        livreurId: string,
        colisId: string,
        data: UpdateColisStatusData
    ): Promise<Colis> {
        return await apiClient.patch<Colis>(
            `/livreurs/${livreurId}/colis/${colisId}/statut`,
            data
        );
    },
};