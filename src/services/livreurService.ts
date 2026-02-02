import {CreateLivreurData, Livreur, PageResponse} from "../types";
import {apiClient} from "./api";

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

    async create(data: CreateLivreurData): Promise<Livreur> {
        return await apiClient.post<Livreur>('/livreurs', data);
    },

    async update(id: string, data: CreateLivreurData): Promise<Livreur> {
        return await apiClient.put<Livreur>(`/livreurs/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/livreurs/${id}`);
    },
};