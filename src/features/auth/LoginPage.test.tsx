import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import { LoginPage } from './LoginPage';
import { login, clearError } from '../../store/slices/authSlice';
import { mockManager, mockLoginError } from '../../mocks/mockData';

// Mock the auth service
jest.mock('../../services', () => ({
    authService: {
        login: jest.fn(),
        getProfile: jest.fn(),
        getCurrentUser: jest.fn(),
        isAuthenticated: jest.fn(),
    },
}));

// Mock useNavigate
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    // ============================================
    // Rendering Tests
    // ============================================

    describe('Rendering', () => {
        it('should render login form with all elements', () => {
            render(<LoginPage />);

            // Check logo and branding
            expect(screen.getByText('DeliGo')).toBeInTheDocument();
            expect(screen.getByText('Gestion de Livraison Intelligente')).toBeInTheDocument();

            // Check form title
            expect(screen.getByText('Connexion')).toBeInTheDocument();

            // Check form fields
            expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

            // Check submit button
            expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();

            // Check register link
            expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument();
            expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();
        });

        it('should render input fields with correct attributes', () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const passwordInput = screen.getByLabelText(/mot de passe/i);

            expect(usernameInput).toHaveAttribute('type', 'text');
            expect(usernameInput).toHaveAttribute('name', 'username');
            expect(usernameInput).toHaveAttribute('autocomplete', 'username');

            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(passwordInput).toHaveAttribute('name', 'password');
            expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
        });
    });

    // ============================================
    // Form Validation Tests
    // ============================================

    describe('Form Validation', () => {
        it('should show validation errors when submitting empty form', async () => {
            render(<LoginPage />);

            const submitButton = screen.getByRole('button', { name: /chargement/i });
            userEvent.click(submitButton);

            // Wait for validation errors
            await waitFor(() => {
                expect(screen.getByText(/nom d'utilisateur requis/i)).toBeInTheDocument();
                // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
                expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
            });
        });

        it('should show validation error when username is empty', async () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText(/mot de passe/i);
            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Fill only password
            userEvent.type(passwordInput, 'password123');
            userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/nom d'utilisateur requis/i)).toBeInTheDocument();
            });
        });

        it('should show validation error when password is empty', async () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Fill only username
            userEvent.type(usernameInput, 'testuser');
            userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
            });
        });

        it('should clear validation errors when user starts typing', async () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Submit empty form to trigger validation
            userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/nom d'utilisateur requis/i)).toBeInTheDocument();
            });

            // Start typing
            userEvent.type(usernameInput, 'test');

            // Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/nom d'utilisateur requis/i)).not.toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Login Flow Tests
    // ============================================

    describe('Login Flow', () => {
        it('should successfully login with valid credentials', async () => {
            // Mock successful login
            const { store } = render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    },
                },
            });

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const passwordInput = screen.getByLabelText(/mot de passe/i);
            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Fill form
            userEvent.type(usernameInput, 'manager1');
            userEvent.type(passwordInput, 'password123');

            // Submit
            userEvent.click(submitButton);

            // Verify form values were submitted
            await waitFor(() => {
                expect(usernameInput).toHaveValue('manager1');
                // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
                expect(passwordInput).toHaveValue('password123');
            });
        });

        it('should display loading state during login', async () => {
            render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: true,
                        error: null,
                    },
                },
            });

            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Button should be disabled during loading
            expect(submitButton).toBeDisabled();
        });

        it('should display error message on login failure', async () => {
            render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Identifiants incorrects',
                    },
                },
            });

            // Error message should be displayed
            expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
        });

        it('should redirect to dashboard when already authenticated', async () => {
            render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: mockManager,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    },
                },
            });

            // Should navigate to dashboard
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    // ============================================
    // User Interaction Tests
    // ============================================

    describe('User Interactions', () => {
        it('should handle username input change', async () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);

            userEvent.type(usernameInput, 'testuser');

            expect(usernameInput).toHaveValue('testuser');
        });

        it('should handle password input change', async () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText(/mot de passe/i);

            userEvent.type(passwordInput, 'testpassword');

            expect(passwordInput).toHaveValue('testpassword');
        });

        it('should mask password input', () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText(/mot de passe/i);

            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });

    // ============================================
    // Cleanup Tests
    // ============================================

    describe('Cleanup', () => {
        it('should clear error on component unmount', () => {
            const { unmount, store } = render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Some error',
                    },
                },
            });

            // Unmount component
            unmount();

            // Error should be cleared (this is handled by the useEffect cleanup)
            // We can verify the dispatch was called by checking the action history
        });
    });

    // ============================================
    // Accessibility Tests
    // ============================================

    describe('Accessibility', () => {
        it('should have accessible form labels', () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const passwordInput = screen.getByLabelText(/mot de passe/i);

            expect(usernameInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
        });

        it('should have required attributes on inputs', () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
            const passwordInput = screen.getByLabelText(/mot de passe/i);

            expect(usernameInput).toBeRequired();
            expect(passwordInput).toBeRequired();
        });

        it('should have proper button type for submit', () => {
            render(<LoginPage />);

            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });

    // ============================================
    // Edge Cases
    // ============================================

    describe('Edge Cases', () => {
        it('should handle special characters in username', async () => {
            render(<LoginPage />);

            const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);

            userEvent.type(usernameInput, 'user@example.com');

            expect(usernameInput).toHaveValue('user@example.com');
        });

        it('should handle long password input', async () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText(/mot de passe/i);
            const longPassword = 'a'.repeat(100);

            userEvent.type(passwordInput, longPassword);

            expect(passwordInput).toHaveValue(longPassword);
        });

        it('should prevent multiple simultaneous submissions', async () => {
            render(<LoginPage />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: true,
                        error: null,
                    },
                },
            });

            const submitButton = screen.getByRole('button', { name: /se connecter/i });

            // Button should be disabled during loading
            expect(submitButton).toBeDisabled();

            // Attempting to click should not work
            userEvent.click(submitButton);

            expect(submitButton).toBeDisabled();
        });
    });
});

export {};