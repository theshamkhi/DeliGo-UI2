import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import './AuthPages.css';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                        <h2 style={{ marginBottom: '1rem' }}>Accès Non Autorisé</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        </p>
                        <Button variant="primary" onClick={() => navigate('/dashboard')}>
                            Retour au Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UnauthorizedPage;