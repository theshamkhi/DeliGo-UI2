import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './features/auth/LoginPage';
import { UserRole } from './types';

// Lazy load pages
const DashboardPage = React.lazy(() => import('./features/dashboard/DashboardPage'));
const LivreurDashboard = React.lazy(() => import('./features/livreurs/LivreurDashboard'));
const ColisListPage = React.lazy(() => import('./features/colis/ColisListPage'));
const ColisDetailPage = React.lazy(() => import('./features/colis/ColisDetailPage'));
const ColisCreatePage = React.lazy(() => import('./features/colis/ColisCreatePage'));
const ColisEditPage = React.lazy(() => import('./features/colis/ColisEditPage'));
const ClientsPage = React.lazy(() => import('./features/clients/ClientsPage'));
const DestinatairesPage = React.lazy(() => import('./features/destinataires/DestinatairesPage'));
const LivreursPage = React.lazy(() => import('./features/livreurs/LivreursPage'));
const ZonesPage = React.lazy(() => import('./features/zones/ZonesPage'));
const ProduitsPage = React.lazy(() => import('./features/produits/ProduitsPage'));
const AdminUsersPage = React.lazy(() => import('./features/admin/AdminUsersPage'));
const ProfilePage = React.lazy(() => import('./features/profile/ProfilePage'));
const UnauthorizedPage = React.lazy(() => import('./features/auth/UnauthorizedPage'));
const TrackingPage = React.lazy(() => import('./features/tracking/TrackingPage')); // NEW

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <React.Suspense fallback={<div className="app-loading">Chargement...</div>}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/track" element={<TrackingPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />

                            <Route path="dashboard" element={<DashboardPage />} />

                            {/* Livreur Tournee */}
                            <Route
                                path="tournee"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.LIVREUR]}>
                                        <LivreurDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="profile" element={<ProfilePage />} />

                            {/* Colis routes - all authenticated users */}
                            <Route path="colis">
                                <Route index element={<ColisListPage />} />
                                <Route path=":id" element={<ColisDetailPage />} />
                                <Route
                                    path="create"
                                    element={
                                        <ProtectedRoute requiredRoles={[UserRole.MANAGER, UserRole.CLIENT]}>
                                            <ColisCreatePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="edit/:id"
                                    element={
                                        <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                            <ColisEditPage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Route>

                            {/* Manager only routes */}
                            <Route
                                path="clients"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                        <ClientsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="livreurs"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                        <LivreursPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="zones"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                        <ZonesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="produits"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                        <ProduitsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin routes - Manager only */}
                            <Route
                                path="admin/users"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER]}>
                                        <AdminUsersPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Manager and Client routes */}
                            <Route
                                path="destinataires"
                                element={
                                    <ProtectedRoute requiredRoles={[UserRole.MANAGER, UserRole.CLIENT]}>
                                        <DestinatairesPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </React.Suspense>
            </Router>
        </Provider>
    );
};

export default App;