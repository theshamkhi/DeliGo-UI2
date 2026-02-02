import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchColisById, clearSelectedColis, updateColisStatus, deleteColis } from '../../store/slices/colisSlice';
import { colisService } from '../../services/colisService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { getStatutLabel, formatDateTime, formatWeight, getPrioriteLabel } from '../../utils/formatters';
import { ColisStatut, HistoriqueLivraison } from '../../types';
import './ColisPages.css';

const ColisDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedColis, isLoading } = useAppSelector((state) => state.colis);
    const { isManager, isLivreur, user } = useAuth();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState<ColisStatut>(ColisStatut.CREE);
    const [statusComment, setStatusComment] = useState('');
    const [history, setHistory] = useState<HistoriqueLivraison[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchColisById(id));
            loadHistory(id);
        }
        return () => {
            dispatch(clearSelectedColis());
        };
    }, [dispatch, id]);

    const loadHistory = async (colisId: string) => {
        try {
            setLoadingHistory(true);
            const data = await colisService.getHistory(colisId);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const canUpdateStatus = (): boolean => {
        if (!selectedColis) return false;

        // Manager peut toujours changer le statut
        if (isManager()) return true;

        // Livreur peut changer uniquement si le colis lui est assigné
        if (isLivreur() && user?.livreurId) {
            return selectedColis.livreurId === user.livreurId;
        }

        return false;
    };

    const getAvailableStatuses = (): ColisStatut[] => {
        if (!selectedColis) return [];

        const currentStatus = selectedColis.statut;

        // Manager a accès à tous les statuts
        if (isManager()) {
            return Object.values(ColisStatut);
        }

        // Livreur a accès aux statuts de son workflow
        if (isLivreur()) {
            switch (currentStatus) {
                case ColisStatut.CREE:
                    return [ColisStatut.CREE, ColisStatut.COLLECTE];
                case ColisStatut.COLLECTE:
                    return [ColisStatut.COLLECTE, ColisStatut.EN_STOCK, ColisStatut.EN_TRANSIT];
                case ColisStatut.EN_STOCK:
                    return [ColisStatut.EN_STOCK, ColisStatut.EN_TRANSIT];
                case ColisStatut.EN_TRANSIT:
                    return [ColisStatut.EN_TRANSIT, ColisStatut.LIVRE, ColisStatut.RETOURNE];
                case ColisStatut.LIVRE:
                    return [ColisStatut.LIVRE];
                case ColisStatut.ANNULE:
                case ColisStatut.RETOURNE:
                    return [currentStatus];
                default:
                    return [currentStatus];
            }
        }

        return [currentStatus];
    };

    const handleStatusChange = async () => {
        if (!id) return;

        try {
            setUpdatingStatus(true);
            await dispatch(
                updateColisStatus({
                    id,
                    data: {
                        statut: newStatus,
                        commentaire: statusComment || undefined,
                    },
                })
            ).unwrap();

            setShowStatusModal(false);
            setStatusComment('');
            loadHistory(id);
        } catch (error: any) {
            console.error('Failed to update status:', error);
            alert(error.message || 'Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (id && window.confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) {
            try {
                await dispatch(deleteColis(id)).unwrap();
                navigate('/colis');
            } catch (error) {
                console.error('Failed to delete colis:', error);
            }
        }
    };

    const openStatusModal = () => {
        if (selectedColis) {
            setNewStatus(selectedColis.statut);
            setStatusComment('');
            setShowStatusModal(true);
        }
    };

    if (isLoading) return <Loading fullScreen />;

    if (!selectedColis) {
        return (
            <div className="error-container">
                <h2>Colis non trouvé</h2>
                <Button onClick={() => navigate('/colis')}>Retour à la liste</Button>
            </div>
        );
    }

    const statusOptions = getAvailableStatuses().map((status) => ({
        value: status,
        label: getStatutLabel(status),
    }));

    return (
        <div className="colis-detail-container">
            <div className="detail-header">
                <Button variant="outline" onClick={() => navigate('/colis')}>
                    ← Retour à la liste
                </Button>
                <div className="detail-actions">
                    {canUpdateStatus() && (
                        <Button variant="primary" onClick={openStatusModal}>
                            {isLivreur() ? '🚚 Mettre à jour le statut' : 'Modifier le statut'}
                        </Button>
                    )}
                    {isManager() && (
                        <>
                            <Button variant="secondary" onClick={() => navigate(`/colis/edit/${id}`)}>
                                Modifier
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                Supprimer
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <h1>Détails du Colis</h1>
            <p className="ref-subtitle">
                Référence: {selectedColis.id.substring(0, 8).toUpperCase()}
                {isLivreur() && selectedColis.livreurId === user?.livreurId && (
                    <span style={{ marginLeft: '1rem', color: 'var(--success-main)', fontWeight: 'bold' }}>
            ✓ Assigné à vous
          </span>
                )}
            </p>

            <div className="detail-grid">
                <Card title="Informations Générales" padding="large">
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Description</label>
                            <span>{selectedColis.description}</span>
                        </div>
                        <div className="info-item">
                            <label>Poids</label>
                            <span>{formatWeight(selectedColis.poids)}</span>
                        </div>
                        <div className="info-item">
                            <label>Priorité</label>
                            <span className="priority-badge" data-priority={selectedColis.priorite.toLowerCase()}>
                {getPrioriteLabel(selectedColis.priorite)}
              </span>
                        </div>
                        <div className="info-item">
                            <label>Statut</label>
                            <span className="status-badge" style={{ backgroundColor: 'var(--primary-600)', color: 'white' }}>
                {getStatutLabel(selectedColis.statut)}
              </span>
                        </div>
                        <div className="info-item">
                            <label>Ville de destination</label>
                            <span>{selectedColis.villeDestination}</span>
                        </div>
                        <div className="info-item">
                            <label>Date de création</label>
                            <span>{formatDateTime(selectedColis.dateCreation)}</span>
                        </div>
                        {selectedColis.dateLimiteLivraison && (
                            <div className="info-item">
                                <label>Date limite de livraison</label>
                                <span>{formatDateTime(selectedColis.dateLimiteLivraison)}</span>
                            </div>
                        )}
                        {selectedColis.commentaire && (
                            <div className="info-item full-width">
                                <label>Commentaire</label>
                                <span>{selectedColis.commentaire}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Historique des changements" padding="large">
                    {loadingHistory ? (
                        <Loading />
                    ) : history.length === 0 ? (
                        <p className="empty-message">Aucun historique disponible</p>
                    ) : (
                        <div className="history-timeline">
                            {history.map((item) => (
                                <div key={item.id} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-status">
                                            {getStatutLabel(item.ancienStatut)} → {getStatutLabel(item.nouveauStatut)}
                                        </div>
                                        <div className="timeline-date">{formatDateTime(item.dateChangement)}</div>
                                        {item.commentaire && (
                                            <div className="timeline-comment">{item.commentaire}</div>
                                        )}
                                        {item.modifiePar && (
                                            <div className="timeline-user">Par: {item.modifiePar}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title={isLivreur() ? "Mettre à jour le statut de livraison" : "Modifier le statut du colis"}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowStatusModal(false)} disabled={updatingStatus}>
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleStatusChange}
                            isLoading={updatingStatus}
                            disabled={newStatus === selectedColis.statut}
                        >
                            Confirmer
                        </Button>
                    </>
                }
            >
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Statut actuel: <strong>{getStatutLabel(selectedColis.statut)}</strong>
                    </p>
                </div>

                <Select
                    label="Nouveau statut"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ColisStatut)}
                    options={statusOptions}
                />

                <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="statusComment" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Commentaire {isLivreur() && '(optionnel)'}
                    </label>
                    <textarea
                        id="statusComment"
                        className="input"
                        placeholder={isLivreur() ? "Ex: Colis collecté à 9h30, signature client obtenue" : "Commentaire optionnel"}
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        rows={3}
                        style={{ width: '100%', resize: 'vertical' }}
                    />
                </div>

                {isLivreur() && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--info-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                        💡 <strong>Conseil:</strong> Ajoutez un commentaire pour tracer vos actions (heure, signature, remarques)
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ColisDetailPage;