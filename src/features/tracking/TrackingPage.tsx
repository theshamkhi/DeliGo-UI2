import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { colisService } from '../../services';
import { Colis, HistoriqueLivraison } from '../../types';
import {
    getStatutLabel,
    getStatutColor,
    getPrioriteLabel,
    formatDate,
} from '../../utils/formatters';
import './TrackingPage.css';

const TrackingPage: React.FC = () => {
    const [trackingId, setTrackingId] = useState('');
    const [colis, setColis] = useState<Colis | null>(null);
    const [historique, setHistorique] = useState<HistoriqueLivraison[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingId.trim()) {
            setError('Veuillez entrer un numéro de suivi');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch colis details
            const colisData = await colisService.getById(trackingId);
            setColis(colisData);

            // Fetch delivery history
            try {
                const historyData = await colisService.getHistorique(trackingId);
                setHistorique(Array.isArray(historyData) ? historyData : []);
            } catch (err) {
                console.warn('No history available:', err);
                setHistorique([]);
            }
        } catch (err: any) {
            console.error('Tracking error:', err);
            setError('Colis introuvable. Vérifiez votre numéro de suivi.');
            setColis(null);
            setHistorique([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (statut: string): string => {
        const icons: Record<string, string> = {
            CREE: '📝',
            COLLECTE: '📥',
            EN_STOCK: '📦',
            EN_TRANSIT: '🚚',
            LIVRE: '✅',
            ANNULE: '❌',
            RETOURNE: '↩️',
        };
        return icons[statut] || '📦';
    };

    const getProgressPercentage = (statut: string): number => {
        const progress: Record<string, number> = {
            CREE: 15,
            COLLECTE: 30,
            EN_STOCK: 50,
            EN_TRANSIT: 75,
            LIVRE: 100,
            ANNULE: 100,
            RETOURNE: 100,
        };
        return progress[statut] || 0;
    };

    return (
        <div className="tracking-page">
            <div className="tracking-container">
                <div className="tracking-header">
                    <div className="logo">📦 DeliGo</div>
                    <h1>Suivi de Colis</h1>
                    <p>Entrez votre numéro de suivi pour connaître l'état de votre livraison</p>
                </div>

                <Card className="tracking-search-card">
                    <form onSubmit={handleTrack} className="tracking-form">
                        <Input
                            placeholder="Entrez votre numéro de suivi (ex: abc123...)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            fullWidth
                        >
                            🔍 Suivre mon colis
                        </Button>
                    </form>

                    {error && (
                        <div className="tracking-error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}
                </Card>

                {isLoading && (
                    <div style={{ padding: '3rem' }}>
                        <Loading />
                    </div>
                )}

                {colis && !isLoading && (
                    <>
                        {/* Tracking Info Card */}
                        <Card className="tracking-info-card">
                            <div className="tracking-info-header">
                                <div>
                                    <h2>Colis #{colis.id.substring(0, 8).toUpperCase()}</h2>
                                    <p className="tracking-description">{colis.description}</p>
                                </div>
                                <span
                                    className="status-badge-large"
                                    style={{
                                        backgroundColor: getStatutColor(colis.statut),
                                        color: 'white',
                                    }}
                                >
                                    {getStatutLabel(colis.statut)}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="tracking-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${getProgressPercentage(colis.statut)}%`,
                                        }}
                                    />
                                </div>
                                <div className="progress-label">
                                    {getProgressPercentage(colis.statut)}% complété
                                </div>
                            </div>

                            {/* Colis Details */}
                            <div className="tracking-details">
                                <div className="detail-row">
                                    <span className="detail-icon">📍</span>
                                    <div className="detail-content">
                                        <strong>Destination</strong>
                                        <p>{colis.villeDestination}</p>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">⚖️</span>
                                    <div className="detail-content">
                                        <strong>Poids</strong>
                                        <p>{colis.poids} kg</p>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">⭐</span>
                                    <div className="detail-content">
                                        <strong>Priorité</strong>
                                        <p>{getPrioriteLabel(colis.priorite)}</p>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">📅</span>
                                    <div className="detail-content">
                                        <strong>Date de création</strong>
                                        <p>{formatDate(colis.dateCreation)}</p>
                                    </div>
                                </div>
                                {colis.dateLimiteLivraison && (
                                    <div className="detail-row">
                                        <span className="detail-icon">⏰</span>
                                        <div className="detail-content">
                                            <strong>Livraison prévue</strong>
                                            <p>{formatDate(colis.dateLimiteLivraison)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {colis.commentaire && (
                                <div className="tracking-comment">
                                    <strong>💬 Commentaire:</strong>
                                    <p>{colis.commentaire}</p>
                                </div>
                            )}
                        </Card>

                        {/* Timeline */}
                        <Card className="tracking-timeline-card">
                            <h3>📋 Historique de livraison</h3>
                            {historique.length > 0 ? (
                                <div className="timeline">
                                    {historique
                                        .sort((a, b) =>
                                            new Date(b.dateChangement).getTime() -
                                            new Date(a.dateChangement).getTime()
                                        )
                                        .map((h, index) => (
                                            <div key={h.id} className="timeline-item">
                                                <div className="timeline-marker">
                                                    {getStatusIcon(h.nouveauStatut)}
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <strong>{getStatutLabel(h.nouveauStatut)}</strong>
                                                        <span className="timeline-date">
                                                            {formatDate(h.dateChangement)}
                                                        </span>
                                                    </div>
                                                    {h.commentaire && (
                                                        <p className="timeline-comment">{h.commentaire}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="empty-timeline">
                                    <p>Aucun historique disponible pour ce colis</p>
                                </div>
                            )}
                        </Card>

                        {/* Help Section */}
                        <Card className="tracking-help-card">
                            <h4>❓ Besoin d'aide ?</h4>
                            <p>
                                Si vous avez des questions concernant votre livraison ou si vous
                                constatez un problème, veuillez contacter notre service client.
                            </p>
                            <div className="help-contact">
                                <div>📞 Téléphone: +212 5XX-XXXXXX</div>
                                <div>📧 Email: support@deligo.ma</div>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default TrackingPage;