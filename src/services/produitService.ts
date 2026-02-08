import { apiClient } from './api';
import {
    Produit,
    CreateProduitData,
    PageResponse,
} from '../types';

/**
 * Produit Service - For product catalog management
 */
export const produitService = {
    /**
     * Get all produits with pagination
     */
    async getAll(params?: { page?: number; size?: number }): Promise<PageResponse<Produit>> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Produit>>(`/produits?${queryParams.toString()}`);
    },

    /**
     * Get a specific produit by ID
     */
    async getById(id: string): Promise<Produit> {
        return await apiClient.get<Produit>(`/produits/${id}`);
    },

    /**
     * Search produits by keyword
     */
    async search(params: {
        keyword: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Produit>> {
        const queryParams = new URLSearchParams();
        queryParams.append('keyword', params.keyword);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        return await apiClient.get<PageResponse<Produit>>(`/produits/search?${queryParams.toString()}`);
    },

    /**
     * Create a new produit
     */
    async create(data: CreateProduitData): Promise<Produit> {
        return await apiClient.post<Produit>('/produits', data);
    },

    /**
     * Update an existing produit
     */
    async update(id: string, data: CreateProduitData): Promise<Produit> {
        return await apiClient.put<Produit>(`/produits/${id}`, data);
    },

    /**
     * Delete a produit
     */
    async delete(id: string): Promise<void> {
        return await apiClient.delete<void>(`/produits/${id}`);
    },
};