import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { colisService } from '../../services';
import {
    Colis,
    CreateColisData,
    UpdateColisData,
    UpdateColisStatusData,
    PageResponse,
    ColisStatistics,
    ColisPriorite,
} from '../../types';

interface ColisState {
    colis: Colis[];
    selectedColis: Colis | null;
    statistics: ColisStatistics | null;
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: ColisState = {
    colis: [],
    selectedColis: null,
    statistics: null,
    pagination: {
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
    },
    isLoading: false,
    error: null,
};

// ============================================
// Async thunks
// ============================================

/**
 * Fetch all colis (filtered by authenticated user on backend)
 * - MANAGER: all colis
 * - LIVREUR: only their assigned colis
 * - CLIENT: only their colis
 */
export const fetchColis = createAsyncThunk(
    'colis/fetchColis',
    async (params: { page?: number; size?: number; sort?: string }, { rejectWithValue }) => {
        try {
            return await colisService.getAll(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch colis');
        }
    }
);

export const fetchColisById = createAsyncThunk(
    'colis/fetchColisById',
    async (id: string, { rejectWithValue }) => {
        try {
            console.log('[Redux] Fetching colis by ID:', id);
            const result = await colisService.getById(id);
            console.log('[Redux] Colis fetched successfully:', result);
            return result;
        } catch (error: any) {
            console.error('[Redux] Error fetching colis:', error);
            console.error('[Redux] Error response:', error.response);

            const errorMessage = error.response?.data?.message
                || error.message
                || 'Failed to fetch colis';

            console.error('[Redux] Rejecting with:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const searchColis = createAsyncThunk(
    'colis/searchColis',
    async (params: { keyword: string; page?: number; size?: number }, { rejectWithValue }) => {
        try {
            return await colisService.search(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

export const createColis = createAsyncThunk(
    'colis/createColis',
    async (data: CreateColisData, { rejectWithValue }) => {
        try {
            return await colisService.create(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create colis');
        }
    }
);

export const updateColis = createAsyncThunk(
    'colis/updateColis',
    async ({ id, data }: { id: string; data: UpdateColisData }, { rejectWithValue }) => {
        try {
            return await colisService.update(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update colis');
        }
    }
);

export const updateColisStatus = createAsyncThunk(
    'colis/updateColisStatus',
    async ({ id, data }: { id: string; data: UpdateColisStatusData }, { rejectWithValue }) => {
        try {
            return await colisService.updateStatus(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const deleteColis = createAsyncThunk(
    'colis/deleteColis',
    async (id: string, { rejectWithValue }) => {
        try {
            await colisService.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete colis');
        }
    }
);

export const fetchStatistics = createAsyncThunk(
    'colis/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            return await colisService.getStatistics();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

export const fetchOverdueColis = createAsyncThunk(
    'colis/fetchOverdueColis',
    async (_, { rejectWithValue }) => {
        try {
            return await colisService.getOverdue();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue colis');
        }
    }
);

export const fetchColisByPriorite = createAsyncThunk(
    'colis/fetchColisByPriorite',
    async (
        { priorite, page, size }: { priorite: ColisPriorite; page?: number; size?: number },
        { rejectWithValue }
    ) => {
        try {
            return await colisService.getByPriorite(priorite, { page, size });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch colis by priorite');
        }
    }
);

const colisSlice = createSlice({
    name: 'colis',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedColis: (state) => {
            state.selectedColis = null;
        },
    },
    extraReducers: (builder) => {
        // Helper function to handle paginated responses
        const handlePaginatedResponse = (state: ColisState, action: PayloadAction<PageResponse<Colis>>) => {
            state.isLoading = false;
            state.colis = action.payload.content;
            state.pagination = {
                page: action.payload.number,
                size: action.payload.size,
                totalElements: action.payload.totalElements,
                totalPages: action.payload.totalPages,
            };
        };

        // Fetch colis
        builder
            .addCase(fetchColis.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchColis.fulfilled, handlePaginatedResponse)
            .addCase(fetchColis.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch colis by ID
        builder
            .addCase(fetchColisById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchColisById.fulfilled, (state, action: PayloadAction<Colis>) => {
                state.isLoading = false;
                state.selectedColis = action.payload;
            })
            .addCase(fetchColisById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Search colis
        builder
            .addCase(searchColis.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchColis.fulfilled, handlePaginatedResponse)
            .addCase(searchColis.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create colis
        builder
            .addCase(createColis.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createColis.fulfilled, (state, action: PayloadAction<Colis>) => {
                state.isLoading = false;
                state.colis.unshift(action.payload);
            })
            .addCase(createColis.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update colis
        builder
            .addCase(updateColis.fulfilled, (state, action: PayloadAction<Colis>) => {
                const index = state.colis.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.colis[index] = action.payload;
                }
                if (state.selectedColis?.id === action.payload.id) {
                    state.selectedColis = action.payload;
                }
            });

        // Update status
        builder
            .addCase(updateColisStatus.fulfilled, (state, action: PayloadAction<Colis>) => {
                const index = state.colis.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.colis[index] = action.payload;
                }
                if (state.selectedColis?.id === action.payload.id) {
                    state.selectedColis = action.payload;
                }
            });

        // Delete colis
        builder.addCase(deleteColis.fulfilled, (state, action: PayloadAction<string>) => {
            state.colis = state.colis.filter((c) => c.id !== action.payload);
        });

        // Fetch statistics
        builder
            .addCase(fetchStatistics.fulfilled, (state, action: PayloadAction<ColisStatistics>) => {
                state.statistics = action.payload;
            });

        // Fetch overdue colis
        builder
            .addCase(fetchOverdueColis.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOverdueColis.fulfilled, (state, action: PayloadAction<Colis[]>) => {
                state.isLoading = false;
                state.colis = action.payload;
            })
            .addCase(fetchOverdueColis.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch by priorite
        builder
            .addCase(fetchColisByPriorite.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchColisByPriorite.fulfilled, handlePaginatedResponse)
            .addCase(fetchColisByPriorite.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedColis } = colisSlice.actions;
export default colisSlice.reducer;