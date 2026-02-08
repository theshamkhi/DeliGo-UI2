import { CreateZoneData, PageResponse, Zone, Colis } from "../types";
import { apiClient } from "./api";

export const zoneService = {
    async getAll(params?: { page?: number; size?: number }): Promise<PageResponse<Zone>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Zone>>(`/zones?${queryParams.toString()}`);
    },

    async getById(id: string): Promise<Zone> {
        return await apiClient.get<Zone>(`/zones/${id}`);
    },

    async create(data: CreateZoneData): Promise<Zone> {
        return await apiClient.post<Zone>('/zones', data);
    },

    async update(id: string, data: CreateZoneData): Promise<Zone> {
        return await apiClient.put<Zone>(`/zones/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/zones/${id}`);
    },

    // ============================================
    // NEW: Get colis in a zone
    // ============================================

    /**
     * Get all colis within a specific zone
     */
    async getColis(
        zoneId: string,
        params?: { page?: number; size?: number }
    ): Promise<PageResponse<Colis>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());

        return await apiClient.get<PageResponse<Colis>>(
            `/zones/${zoneId}/colis?${queryParams.toString()}`
        );
    },
};