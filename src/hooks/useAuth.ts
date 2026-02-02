import { useAppSelector } from '../store';
import { UserRole } from '../types';

export const useAuth = () => {
    const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

    const hasRole = (role: UserRole): boolean => {
        return user?.roles.includes(role) || false;
    };

    const hasAnyRole = (roles: UserRole[]): boolean => {
        return roles.some((role) => user?.roles.includes(role)) || false;
    };

    const hasPermission = (permission: string): boolean => {
        return user?.permissions.includes(permission) || false;
    };

    const isManager = (): boolean => hasRole(UserRole.MANAGER);
    const isLivreur = (): boolean => hasRole(UserRole.LIVREUR);
    const isClient = (): boolean => hasRole(UserRole.CLIENT);
    const isDestinataire = (): boolean => hasRole(UserRole.DESTINATAIRE);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        hasRole,
        hasAnyRole,
        hasPermission,
        isManager,
        isLivreur,
        isClient,
        isDestinataire,
    };
};