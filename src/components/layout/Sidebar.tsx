import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

interface NavGroup {
    title?: string;
    items: NavItem[];
}

export const Sidebar: React.FC = () => {
    const { isManager, isClient, isLivreur } = useAuth();

    // Build navigation based on user role
    const buildNavGroups = (): NavGroup[] => {
        const groups: NavGroup[] = [];

        // Main Dashboard/Tournée
        groups.push({
            items: [
                isLivreur()
                    ? { to: '/tournee', icon: '🚚', label: 'Ma Tournée' }
                    : { to: '/dashboard', icon: '📊', label: 'Dashboard' }
            ]
        });

        // Operations section - available to all authenticated users
        const operationsItems: NavItem[] = [
            { to: '/colis', icon: '📦', label: 'Colis' }
        ];

        // Add Destinataires for Manager and Client
        if (isManager() || isClient()) {
            operationsItems.push({ to: '/destinataires', icon: '📍', label: 'Destinataires' });
        }

        // Add Tracking for all users
        operationsItems.push({ to: '/track', icon: '🔍', label: 'Suivi Colis' });

        groups.push({
            title: 'Opérations',
            items: operationsItems
        });

        // Management section - Manager only
        if (isManager()) {
            groups.push({
                title: 'Gestion',
                items: [
                    { to: '/clients', icon: '🏢', label: 'Clients' },
                    { to: '/livreurs', icon: '🚛', label: 'Livreurs' },
                    { to: '/zones', icon: '🗺️', label: 'Zones' },
                    { to: '/produits', icon: '📋', label: 'Produits' },
                ]
            });

            // Administration section - Manager only
            groups.push({
                title: 'Administration',
                items: [
                    { to: '/admin/users', icon: '👥', label: 'Utilisateurs' },
                ]
            });
        }

        // Account section - available to all authenticated users
        groups.push({
            title: 'Compte',
            items: [
                { to: '/profile', icon: '👤', label: 'Mon Profil' },
            ]
        });

        return groups;
    };

    const navGroups = buildNavGroups();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">📦</span>
                    <span className="logo-text">DeliGo</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="nav-group">
                        {group.title && (
                            <div className="nav-group-title">{group.title}</div>
                        )}
                        <div className="nav-items">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className="nav-item"
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
};