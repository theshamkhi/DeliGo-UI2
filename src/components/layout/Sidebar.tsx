import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const { isManager, isLivreur, isClient } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon">📦</span>
                <span className="logo-text">DeliGo</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="nav-item">
                    <span>📊</span> Dashboard
                </NavLink>

                <NavLink to="/colis" className="nav-item">
                    <span>📦</span> Colis
                </NavLink>

                {(isManager || isClient) && (
                    <NavLink to="/destinataires" className="nav-item">
                        <span>👥</span> Destinataires
                    </NavLink>
                )}

                {isManager() && (
                    <>
                        <NavLink to="/clients" className="nav-item">
                            <span>🏢</span> Clients
                        </NavLink>
                        <NavLink to="/livreurs" className="nav-item">
                            <span>🚚</span> Livreurs
                        </NavLink>
                        <NavLink to="/zones" className="nav-item">
                            <span>🗺️</span> Zones
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
};