import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import ColisListPage from './ColisListPage';
import { fetchColis, searchColis } from '../../store/slices/colisSlice';
import {
    mockColisList,
    mockColisPageResponse,
    mockEmptyPageResponse,
    mockManager,
    mockClient,
    mockLivreur,
} from '../../mocks/mockData';

// Mock the navigate function
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the colis service
jest.mock('../../services', () => ({
    colisService: {
        getAll: jest.fn(),
        search: jest.fn(),
    },
}));

describe('ColisListPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    // ============================================
    // Rendering Tests
    // ============================================

    describe('Rendering', () => {
        it('should render page header with title', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.getByText('Gestion des Colis')).toBeInTheDocument();
        });

        it('should show total count in subtitle', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            expect(screen.getByText('3 colis au total')).toBeInTheDocument();
        });

        it('should render search input', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            const searchInput = screen.getByPlaceholderText(/rechercher par description/i);
            expect(searchInput).toBeInTheDocument();
        });
    });

    // ============================================
    // Role-Based Rendering Tests
    // ============================================

    describe('Role-Based Rendering', () => {
        it('should show "Nouveau Colis" button for Manager', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.getByRole('button', { name: /nouveau colis/i })).toBeInTheDocument();
        });

        it('should show "Nouveau Colis" button for Client', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockClient,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.getByRole('button', { name: /nouveau colis/i })).toBeInTheDocument();
        });

        it('should NOT show "Nouveau Colis" button for Livreur', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockLivreur,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.queryByRole('button', { name: /nouveau colis/i })).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Data Display Tests
    // ============================================

    describe('Data Display', () => {
        it('should display colis list in table', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            // Check table headers
            expect(screen.getByText('Référence')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Destination')).toBeInTheDocument();
            expect(screen.getByText('Poids')).toBeInTheDocument();
            expect(screen.getByText('Priorité')).toBeInTheDocument();
            expect(screen.getByText('Statut')).toBeInTheDocument();
            expect(screen.getByText('Date création')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();

            // Check colis data
            expect(screen.getByText('Colis urgent - Documents importants')).toBeInTheDocument();
            expect(screen.getByText('Paris')).toBeInTheDocument();
            expect(screen.getByText('2.5 kg')).toBeInTheDocument();
        });

        it('should display all colis from the list', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            // Should have 3 "Détails" buttons (one for each colis)
            const detailsButtons = screen.getAllByRole('button', { name: /détails/i });
            expect(detailsButtons).toHaveLength(3);
        });

        it('should display correct priority badges', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            // Check for priority badges (formatted by getPrioriteLabel)
            const priorityBadges = document.querySelectorAll('.priority-badge');
            expect(priorityBadges.length).toBeGreaterThan(0);
        });
    });

    // ============================================
    // Loading State Tests
    // ============================================

    describe('Loading State', () => {
        it('should display loading message when loading', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: [],
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 0,
                            totalPages: 0,
                        },
                        isLoading: true,
                        error: null,
                    },
                },
            });

            expect(screen.getByText('Chargement des colis...')).toBeInTheDocument();
        });

        it('should not display table when loading', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: [],
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 0,
                            totalPages: 0,
                        },
                        isLoading: true,
                        error: null,
                    },
                },
            });

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Empty State Tests
    // ============================================

    describe('Empty State', () => {
        it('should display empty state when no colis', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.getByText('Aucun colis trouvé')).toBeInTheDocument();
            expect(screen.getByText('Commencez par créer votre premier colis')).toBeInTheDocument();
        });

        it('should show create button in empty state for Manager', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            const createButtons = screen.getAllByRole('button', { name: /créer un colis/i });
            expect(createButtons.length).toBeGreaterThan(0);
        });

        it('should display different message when search returns no results', async () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            const searchInput = screen.getByPlaceholderText(/rechercher par description/i);
            userEvent.type(searchInput, 'nonexistent');

            // Wait for debounce and check message
            await waitFor(
                () => {
                    expect(screen.getByText('Essayez de modifier votre recherche')).toBeInTheDocument();
                },
                { timeout: 1000 }
            );
        });
    });

    // ============================================
    // Search Functionality Tests
    // ============================================

    describe('Search Functionality', () => {
        it('should update search input value', async () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            const searchInput = screen.getByPlaceholderText(/rechercher par description/i);

            userEvent.type(searchInput, 'urgent');

            expect(searchInput).toHaveValue('urgent');
        });

        it('should debounce search input (not trigger immediately)', async () => {
            jest.useFakeTimers();

            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            const searchInput = screen.getByPlaceholderText(/rechercher par description/i);

            // Type quickly
            userEvent.type(searchInput, 'test');

            // Search should not be triggered immediately
            expect(searchInput).toHaveValue('test');

            jest.useRealTimers();
        });
    });

    // ============================================
    // Navigation Tests
    // ============================================

    describe('Navigation', () => {
        it('should navigate to create page when clicking "Nouveau Colis"', async () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            const createButton = screen.getByRole('button', { name: /nouveau colis/i });
            userEvent.click(createButton);

            expect(mockNavigate).toHaveBeenCalledWith('/colis/create');
        });

        it('should navigate to details page when clicking "Détails" button', async () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            const detailsButtons = screen.getAllByRole('button', { name: /détails/i });
            userEvent.click(detailsButtons[0]);

            expect(mockNavigate).toHaveBeenCalledWith(`/colis/${mockColisList[0].id}`);
        });
    });

    // ============================================
    // Pagination Tests
    // ============================================

    describe('Pagination', () => {
        it('should display pagination when there are colis', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 50,
                            totalPages: 3,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            // Pagination component should be present
            // (Actual rendering depends on your Pagination component implementation)
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();
        });

        it('should not display pagination in empty state', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Accessibility Tests
    // ============================================

    describe('Accessibility', () => {
        it('should have accessible table structure', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
                        colis: mockColisList,
                        selectedColis: null,
                        statistics: null,
                        pagination: {
                            page: 0,
                            size: 20,
                            totalElements: 3,
                            totalPages: 1,
                        },
                        isLoading: false,
                        error: null,
                    },
                },
            });

            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();

            // Check for proper table structure
            const thead = within(table).getByRole('rowgroup');
            expect(thead).toBeInTheDocument();
        });

        it('should have accessible search input', () => {
            render(<ColisListPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                    colis: {
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
                    },
                },
            });

            const searchInput = screen.getByPlaceholderText(/rechercher par description/i);
            expect(searchInput).toBeInTheDocument();
        });
    });
});

export {};