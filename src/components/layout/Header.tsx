import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { getInitials } from '../../utils/formatters';
import './Header.css';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <h2>Bienvenue</h2>
            </div>
            <div className="header-right">
                <div className="user-info">
                    <div className="user-avatar">
                        {user && getInitials(user.nom, user.prenom)}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user?.prenom} {user?.nom}</div>
                        <div className="user-role">{user?.roles[0]}</div>
                    </div>
                </div>
                <Button variant="outline" size="small" onClick={handleLogout}>
                    Déconnexion
                </Button>
            </div>
        </header>
    );
};