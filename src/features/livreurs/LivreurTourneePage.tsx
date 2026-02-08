import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colisService } from '../../services/colisService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import { getStatutLabel, getStatutColor, getPrioriteLabel, formatDate } from '../../utils/formatters';
import { Colis, ColisStatut } from '../../types';
import '../colis/ColisPages.css';

const LivreurTourneePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { page, size } = usePagination({ initialSize: 50 });

    const [colis, setColis] = useState<Colis[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    // ✅ Use existing /colis endpoint - backend filters by authenticated user
    useEffect(() => {
        const loadMyDeliveries = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Backend automatically filters by authenticated livreur
                const data = await colisService.getAll({ page, size });
                setColis(data.content || []);
            } catch (err: any) {
                console.error('Failed to load deliveries:', err);
                setError(err.message || 'Erreur lors du chargement de vos livraisons');
                setColis([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadMyDeliveries();
    }, [page, size]);

    if (isLoading) return <Loading fullScreen />;

    if (error) {
        return (
            <div className="error-container">
                <h2>⚠️ Erreur</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    {error}
                </p>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    Retour au tableau de bord
                </Button>
            </div>
        );
    }

    // Filtrer et organiser les colis
    const colisACollecter = colis.filter(c => c.statut === ColisStatut.CREE);
    const colisEnCours = colis.filter(c =>
        c.statut === ColisStatut.COLLECTE ||
        c.statut === ColisStatut.EN_TRANSIT ||
        c.statut === ColisStatut.EN_STOCK
    );
    const colisLivres = colis.filter(c => c.statut === ColisStatut.LIVRE);
    const colisProblemes = colis.filter(c =>
        c.statut === ColisStatut.ANNULE ||
        c.statut === ColisStatut.RETOURNE
    );

    const getFilteredColis = () => {
        switch (filter) {
            case 'pending':
                return [...colisACollecter, ...colisEnCours];
            case 'completed':
                return colisLivres;
            default:
                return colis;
        }
    };

    const filteredColis = getFilteredColis();

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>🚚 Ma Tournée du Jour</h1>
                    <p className="page-subtitle">
                        Bonjour {user?.prenom}, vous avez {colisACollecter.length + colisEnCours.length} colis à gérer aujourd'hui
                    </p>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="stats-grid-main" style={{ marginBottom: '2rem' }}>
                <Card className="stat-card">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                        <div className="stat-label">À Collecter</div>
                        <div className="stat-value">{colisACollecter.length}</div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-content">
                        <div className="stat-label">En Cours</div>
                        <div className="stat-value">{colisEnCours.length}</div>
                    </div>
                </Card>

                <Card className="stat-card stat-card-success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-label">Livrés</div>
                        <div className="stat-value">{colisLivres.length}</div>
                    </div>
                </Card>

                {colisProblemes.length > 0 && (
                    <Card className="stat-card stat-card-warning">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <div className="stat-label">Problèmes</div>
                            <div className="stat-value">{colisProblemes.length}</div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <Button
                    variant={filter === 'pending' ? 'primary' : 'outline'}
                    onClick={() => setFilter('pending')}
                >
                    À traiter ({colisACollecter.length + colisEnCours.length})
                </Button>
                <Button
                    variant={filter === 'completed' ? 'primary' : 'outline'}
                    onClick={() => setFilter('completed')}
                >
                    Livrés ({colisLivres.length})
                </Button>
                <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    Tous ({colis.length})
                </Button>
            </div>

            {/* Liste des colis */}
            {filteredColis.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <div className="empty-icon">
                            {colis.length === 0 ? '📭' : '🎉'}
                        </div>
                        <h3>
                            {colis.length === 0
                                ? 'Aucun colis assigné'
                                : 'Aucun colis dans cette catégorie'}
                        </h3>
                        <p>
                            {colis.length === 0
                                ? 'Vous n\'avez aucun colis assigné pour le moment. Contactez votre manager.'
                                : filter === 'pending'
                                    ? 'Tous vos colis sont livrés !'
                                    : 'Changez de filtre pour voir vos colis'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredColis.map((c) => (
                        <Card key={c.id} className="colis-card" padding="large">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <span className="ref-code">{c.id.substring(0, 8).toUpperCase()}</span>
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: getStatutColor(c.statut),
                                                color: 'white',
                                            }}
                                        >
                                            {getStatutLabel(c.statut)}
                                        </span>
                                        <span
                                            className="priority-badge"
                                            data-priority={c.priorite.toLowerCase()}
                                        >
                                            {getPrioriteLabel(c.priorite)}
                                        </span>
                                    </div>

                                    <h3 style={{ margin: '0.5rem 0', fontSize: '1.125rem' }}>
                                        {c.description}
                                    </h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <div>📍 <strong>Destination:</strong> {c.villeDestination}</div>
                                        <div>⚖️ <strong>Poids:</strong> {c.poids} kg</div>
                                        <div>📅 <strong>Créé:</strong> {formatDate(c.dateCreation)}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => navigate(`/colis/${c.id}`)}
                                    >
                                        {c.statut === ColisStatut.CREE ? '📥 Collecter' :
                                            c.statut === ColisStatut.COLLECTE ? '🚚 Livrer' :
                                                c.statut === ColisStatut.EN_TRANSIT ? '✅ Confirmer' :
                                                    'Détails'}
                                    </Button>
                                </div>
                            </div>

                            {/* Actions rapides selon le statut */}
                            {(c.statut === ColisStatut.CREE || c.statut === ColisStatut.COLLECTE || c.statut === ColisStatut.EN_TRANSIT) && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        {c.statut === ColisStatut.CREE && '💡 Action: Collectez ce colis chez le client'}
                                        {c.statut === ColisStatut.COLLECTE && '💡 Action: Mettez en transit vers la destination'}
                                        {c.statut === ColisStatut.EN_TRANSIT && '💡 Action: Livrez au destinataire et confirmez'}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LivreurTourneePage;