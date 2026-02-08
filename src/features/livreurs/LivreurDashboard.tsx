import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colisService } from '../../services/colisService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import {
    getStatutLabel,
    getStatutColor,
    getPrioriteLabel,
    formatDate,
} from '../../utils/formatters';
import { Colis, ColisStatut, UpdateColisStatusData } from '../../types';
import '../colis/ColisPages.css';

const LivreurDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { page, size } = usePagination({ initialSize: 50 });

    const [colis, setColis] = useState<Colis[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    // Status update modal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
    const [newStatus, setNewStatus] = useState<ColisStatut | ''>('');
    const [statusComment, setStatusComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadMyDeliveries();
    }, [page, size]);

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

    const handleStatusUpdate = async () => {
        if (!selectedColis || !newStatus) return;

        try {
            setIsUpdating(true);

            const updateData: UpdateColisStatusData = {
                statut: newStatus as ColisStatut,
                commentaire: statusComment || undefined,
            };

            await colisService.updateStatus(selectedColis.id, updateData);

            // Reload data
            await loadMyDeliveries();

            // Close modal and reset
            setShowStatusModal(false);
            setSelectedColis(null);
            setNewStatus('');
            setStatusComment('');
        } catch (err: any) {
            console.error('Failed to update status:', err);
            alert('Erreur lors de la mise à jour du statut');
        } finally {
            setIsUpdating(false);
        }
    };

    const openStatusModal = (c: Colis) => {
        setSelectedColis(c);
        setNewStatus('');
        setStatusComment('');
        setShowStatusModal(true);
    };

    const getNextStatus = (currentStatus: ColisStatut): ColisStatut[] => {
        const statusFlow: Record<ColisStatut, ColisStatut[]> = {
            [ColisStatut.CREE]: [ColisStatut.COLLECTE, ColisStatut.ANNULE],
            [ColisStatut.COLLECTE]: [ColisStatut.EN_TRANSIT, ColisStatut.EN_STOCK, ColisStatut.RETOURNE],
            [ColisStatut.EN_STOCK]: [ColisStatut.EN_TRANSIT, ColisStatut.RETOURNE],
            [ColisStatut.EN_TRANSIT]: [ColisStatut.LIVRE, ColisStatut.RETOURNE],
            [ColisStatut.LIVRE]: [],
            [ColisStatut.ANNULE]: [],
            [ColisStatut.RETOURNE]: [],
        };
        return statusFlow[currentStatus] || [];
    };

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

    // Organiser les colis par statut
    const colisACollecter = colis.filter((c) => c.statut === ColisStatut.CREE);
    const colisEnCours = colis.filter(
        (c) =>
            c.statut === ColisStatut.COLLECTE ||
            c.statut === ColisStatut.EN_TRANSIT ||
            c.statut === ColisStatut.EN_STOCK
    );
    const colisLivres = colis.filter((c) => c.statut === ColisStatut.LIVRE);
    const colisProblemes = colis.filter(
        (c) =>
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

    const filteredColis = getFilteredColis()
        .sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { URGENTE: 0, HAUTE: 1, NORMALE: 2 };
            const priorityDiff = priorityOrder[a.priorite] - priorityOrder[b.priorite];
            if (priorityDiff !== 0) return priorityDiff;

            // Then by zone
            if (a.villeDestination !== b.villeDestination) {
                return a.villeDestination.localeCompare(b.villeDestination);
            }

            // Finally by creation date
            return new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
        });

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>🚚 Ma Tournée du Jour</h1>
                    <p className="page-subtitle">
                        Bonjour {user?.prenom}, vous avez{' '}
                        {colisACollecter.length + colisEnCours.length} colis à
                        gérer aujourd'hui
                    </p>
                </div>
                <Button variant="outline" onClick={loadMyDeliveries}>
                    🔄 Actualiser
                </Button>
            </div>

            {/* Statistiques */}
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
                                ? "Vous n'avez aucun colis assigné pour le moment. Contactez votre manager."
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
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        <span className="ref-code">
                                            {c.id.substring(0, 8).toUpperCase()}
                                        </span>
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

                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '0.5rem',
                                            marginTop: '0.75rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <div>
                                            📍 <strong>Destination:</strong> {c.villeDestination}
                                        </div>
                                        <div>
                                            ⚖️ <strong>Poids:</strong> {c.poids} kg
                                        </div>
                                        <div>
                                            📅 <strong>Créé:</strong> {formatDate(c.dateCreation)}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginLeft: '1rem',
                                    }}
                                >
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => navigate(`/colis/${c.id}`)}
                                    >
                                        👁️ Détails
                                    </Button>

                                    {getNextStatus(c.statut).length > 0 && (
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => openStatusModal(c)}
                                        >
                                            {c.statut === ColisStatut.CREE && '📥 Collecter'}
                                            {c.statut === ColisStatut.COLLECTE && '🚚 Mettre en transit'}
                                            {c.statut === ColisStatut.EN_TRANSIT && '✅ Livrer'}
                                            {c.statut === ColisStatut.EN_STOCK && '🚚 Expédier'}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Actions rapides selon le statut */}
                            {(c.statut === ColisStatut.CREE ||
                                c.statut === ColisStatut.COLLECTE ||
                                c.statut === ColisStatut.EN_TRANSIT) && (
                                <div
                                    style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--border-light)',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {c.statut === ColisStatut.CREE &&
                                            '💡 Action: Collectez ce colis chez le client'}
                                        {c.statut === ColisStatut.COLLECTE &&
                                            '💡 Action: Mettez en transit vers la destination'}
                                        {c.statut === ColisStatut.EN_TRANSIT &&
                                            '💡 Action: Livrez au destinataire et confirmez'}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Status Update Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Mettre à jour le statut"
            >
                {selectedColis && (
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>
                                Colis: {selectedColis.id.substring(0, 8).toUpperCase()}
                            </h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                {selectedColis.description}
                            </p>
                            <div style={{ marginTop: '0.5rem' }}>
                                Statut actuel:{' '}
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: getStatutColor(selectedColis.statut),
                                        color: 'white',
                                        marginLeft: '0.5rem',
                                    }}
                                >
                                    {getStatutLabel(selectedColis.statut)}
                                </span>
                            </div>
                        </div>

                        <Select
                            label="Nouveau statut"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as ColisStatut)}
                            required options={[]}                        >
                            <option value="">-- Sélectionnez --</option>
                            {getNextStatus(selectedColis.statut).map((status) => (
                                <option key={status} value={status}>
                                    {getStatutLabel(status)}
                                </option>
                            ))}
                        </Select>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Commentaire (optionnel)
                            </label>
                            <textarea
                                value={statusComment}
                                onChange={(e) => setStatusComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    fontFamily: 'inherit',
                                    fontSize: '0.9375rem',
                                }}
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowStatusModal(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleStatusUpdate}
                                isLoading={isUpdating}
                                disabled={!newStatus}
                            >
                                Mettre à jour
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LivreurDashboard;