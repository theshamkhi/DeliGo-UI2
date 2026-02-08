import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchStatistics } from '../../store/slices/colisSlice';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { statistics, isLoading } = useAppSelector((state) => state.colis);
    const { user, isManager, isLivreur, isClient } = useAuth();

    useEffect(() => {
        dispatch(fetchStatistics());
    }, [dispatch]);

    // Redirect livreur to their dedicated dashboard
    useEffect(() => {
        if (isLivreur()) {
            navigate('/tournee');
        }
    }, [isLivreur, navigate]);

    if (isLoading) return <Loading fullScreen />;

    const getPercentage = (value: number, total: number): string => {
        if (total === 0) return '0';
        return ((value / total) * 100).toFixed(1);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Tableau de Bord</h1>
                    <p className="dashboard-subtitle">
                        Bienvenue, {user?.prenom} {user?.nom} • {user?.roles[0]?.replace('ROLE_', '')}
                    </p>
                </div>
                <div className="dashboard-date">
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {statistics && (
                <>
                    {/* Statistiques principales */}
                    <div className="stats-grid-main">
                        <Card className="stat-card stat-card-primary">
                            <div className="stat-icon">📦</div>
                            <div className="stat-content">
                                <div className="stat-label">Total Colis</div>
                                <div className="stat-value">{statistics.total}</div>
                                <div className="stat-change">Tous statuts confondus</div>
                            </div>
                        </Card>

                        <Card className="stat-card stat-card-info">
                            <div className="stat-icon">🚚</div>
                            <div className="stat-content">
                                <div className="stat-label">En Transit</div>
                                <div className="stat-value">{statistics.enTransit}</div>
                                <div className="stat-change">
                                    {getPercentage(statistics.enTransit, statistics.total)}% du total
                                </div>
                            </div>
                        </Card>

                        <Card className="stat-card stat-card-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <div className="stat-label">Livrés</div>
                                <div className="stat-value">{statistics.livre}</div>
                                <div className="stat-change">
                                    {getPercentage(statistics.livre, statistics.total)}% du total
                                </div>
                            </div>
                        </Card>

                        <Card className="stat-card stat-card-warning">
                            <div className="stat-icon">📋</div>
                            <div className="stat-content">
                                <div className="stat-label">En Stock</div>
                                <div className="stat-value">{statistics.enStock}</div>
                                <div className="stat-change">
                                    {getPercentage(statistics.enStock, statistics.total)}% du total
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Statistiques détaillées */}
                    <div className="dashboard-section">
                        <h2>Répartition par Statut</h2>
                        <div className="stats-grid-detailed">
                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--gray-500)' }}>
                    Créé
                  </span>
                                    <span className="stat-detail-value">{statistics.cree}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.cree, statistics.total)}%`,
                                            backgroundColor: 'var(--gray-400)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--info-main)' }}>
                    Collecté
                  </span>
                                    <span className="stat-detail-value">{statistics.collecte}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.collecte, statistics.total)}%`,
                                            backgroundColor: 'var(--info-main)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--warning-main)' }}>
                    En Stock
                  </span>
                                    <span className="stat-detail-value">{statistics.enStock}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.enStock, statistics.total)}%`,
                                            backgroundColor: 'var(--warning-main)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--primary-600)' }}>
                    En Transit
                  </span>
                                    <span className="stat-detail-value">{statistics.enTransit}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.enTransit, statistics.total)}%`,
                                            backgroundColor: 'var(--primary-600)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--success-main)' }}>
                    Livré
                  </span>
                                    <span className="stat-detail-value">{statistics.livre}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.livre, statistics.total)}%`,
                                            backgroundColor: 'var(--success-main)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--error-main)' }}>
                    Annulé
                  </span>
                                    <span className="stat-detail-value">{statistics.annule}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.annule, statistics.total)}%`,
                                            backgroundColor: 'var(--error-main)'
                                        }}
                                    ></div>
                                </div>
                            </Card>

                            <Card className="stat-detail-card">
                                <div className="stat-detail-header">
                  <span className="status-badge" style={{ backgroundColor: 'var(--secondary-600)' }}>
                    Retourné
                  </span>
                                    <span className="stat-detail-value">{statistics.retourne}</span>
                                </div>
                                <div className="stat-detail-bar">
                                    <div
                                        className="stat-detail-fill"
                                        style={{
                                            width: `${getPercentage(statistics.retourne, statistics.total)}%`,
                                            backgroundColor: 'var(--secondary-600)'
                                        }}
                                    ></div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Informations contextuelles selon le rôle */}
                    {isManager() && (
                        <div className="dashboard-section">
                            <h2>Aperçu Général</h2>
                            <div className="info-cards">
                                <Card>
                                    <h3>🎯 Performance</h3>
                                    <p>
                                        Taux de livraison: <strong>{getPercentage(statistics.livre, statistics.total)}%</strong>
                                    </p>
                                    <p>
                                        En cours: <strong>{statistics.enTransit + statistics.collecte}</strong> colis
                                    </p>
                                </Card>
                                <Card>
                                    <h3>⚠️ Attention Requise</h3>
                                    <p>
                                        Annulés: <strong>{statistics.annule}</strong> colis
                                    </p>
                                    <p>
                                        Retournés: <strong>{statistics.retourne}</strong> colis
                                    </p>
                                </Card>
                            </div>
                        </div>
                    )}

                    {isLivreur() && (
                        <div className="dashboard-section">
                            <Card>
                                <h3>📍 Vos Livraisons</h3>
                                <p>
                                    Vous avez <strong>{statistics.enTransit}</strong> colis en transit
                                    et <strong>{statistics.collecte}</strong> à collecter.
                                </p>
                            </Card>
                        </div>
                    )}

                    {isClient() && (
                        <div className="dashboard-section">
                            <Card>
                                <h3>📮 Vos Expéditions</h3>
                                <p>
                                    Vous avez <strong>{statistics.total}</strong> colis dont{' '}
                                    <strong>{statistics.livre}</strong> déjà livrés.
                                </p>
                            </Card>
                        </div>
                    )}
                </>
            )}

            {!statistics && !isLoading && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Aucune donnée disponible</h3>
                    <p>Les statistiques seront affichées une fois que des colis seront créés.</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;