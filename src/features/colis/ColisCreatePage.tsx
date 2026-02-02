import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { createColis } from '../../store/slices/colisSlice';
import { clientService } from '../../services/clientService';
import { destinataireService } from '../../services/destinataireService';
import { useForm } from '../../hooks/useForm';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ColisPriorite, Client, Destinataire } from '../../types';
import { validators } from '../../utils/validators';
import './ColisPages.css';

const ColisCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [destinataires, setDestinataires] = useState<Destinataire[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientsData, destinatairesData] = await Promise.all([
                    clientService.getAll({ page: 0, size: 100 }),
                    destinataireService.getAll({ page: 0, size: 100 }),
                ]);
                setClients(clientsData.content);
                setDestinataires(destinatairesData.content);
            } catch (err) {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm({
        initialValues: {
            description: '',
            poids: '',
            priorite: ColisPriorite.NORMALE,
            clientExpediteurId: '',
            destinataireId: '',
            villeDestination: '',
            dateLimiteLivraison: '',
            commentaire: '',
        },
        validationRules: {
            description: validators.required('La description est requise'),
            poids: validators.compose(
                validators.required('Le poids est requis'),
                validators.min(0.1, 'Le poids doit être supérieur à 0')
            ),
            clientExpediteurId: validators.required('Le client expéditeur est requis'),
            destinataireId: validators.required('Le destinataire est requis'),
            villeDestination: validators.required('La ville de destination est requise'),
        },
        onSubmit: async (formValues) => {
            try {
                setError(null);
                await dispatch(
                    createColis({
                        ...formValues,
                        poids: Number(formValues.poids),
                        dateLimiteLivraison: formValues.dateLimiteLivraison || undefined,
                    })
                ).unwrap();
                navigate('/colis');
            } catch (err: any) {
                setError(err.message || 'Erreur lors de la création du colis');
            }
        },
    });

    if (loading) {
        return (
            <div className="loading-container">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="colis-create-container">
            <div className="page-header">
                <h1>Créer un Nouveau Colis</h1>
                <Button variant="outline" onClick={() => navigate('/colis')}>
                    Annuler
                </Button>
            </div>

            {error && (
                <div className="error-alert">
                    <strong>Erreur:</strong> {error}
                </div>
            )}

            <Card padding="large">
                <form onSubmit={handleSubmit} className="colis-form">
                    <div className="form-grid">
                        <div className="form-section full-width">
                            <h3>Informations du Colis</h3>
                        </div>

                        <Input
                            name="description"
                            label="Description"
                            placeholder="Description détaillée du colis"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.description ? errors.description : undefined}
                            required
                        />

                        <Input
                            name="poids"
                            label="Poids (kg)"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={values.poids}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.poids ? errors.poids : undefined}
                            required
                        />

                        <Select
                            name="priorite"
                            label="Priorité"
                            value={values.priorite}
                            onChange={handleChange}
                            options={[
                                { value: ColisPriorite.NORMALE, label: 'Normale' },
                                { value: ColisPriorite.HAUTE, label: 'Haute' },
                                { value: ColisPriorite.URGENTE, label: 'Urgente' },
                            ]}
                            required
                        />

                        <Input
                            name="villeDestination"
                            label="Ville de Destination"
                            placeholder="Ex: Casablanca"
                            value={values.villeDestination}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.villeDestination ? errors.villeDestination : undefined}
                            required
                        />

                        <Input
                            name="dateLimiteLivraison"
                            label="Date Limite de Livraison (optionnel)"
                            type="datetime-local"
                            value={values.dateLimiteLivraison}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />

                        <div className="form-section full-width">
                            <h3>Expéditeur et Destinataire</h3>
                        </div>

                        <Select
                            name="clientExpediteurId"
                            label="Client Expéditeur"
                            value={values.clientExpediteurId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.clientExpediteurId ? errors.clientExpediteurId : undefined}
                            options={[
                                { value: '', label: 'Sélectionner un client' },
                                ...clients.map((c) => ({
                                    value: c.id,
                                    label: `${c.prenom} ${c.nom} - ${c.email}`,
                                })),
                            ]}
                            placeholder="Sélectionner un client"
                            required
                        />

                        <Select
                            name="destinataireId"
                            label="Destinataire"
                            value={values.destinataireId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.destinataireId ? errors.destinataireId : undefined}
                            options={[
                                { value: '', label: 'Sélectionner un destinataire' },
                                ...destinataires.map((d) => ({
                                    value: d.id,
                                    label: `${d.prenom} ${d.nom} - ${d.adresse}`,
                                })),
                            ]}
                            placeholder="Sélectionner un destinataire"
                            required
                        />

                        <div className="form-section full-width">
                            <label htmlFor="commentaire">Commentaire (optionnel)</label>
                            <textarea
                                id="commentaire"
                                name="commentaire"
                                className="input"
                                placeholder="Informations complémentaires..."
                                value={values.commentaire}
                                onChange={handleChange}
                                rows={4}
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => navigate('/colis')}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            Créer le Colis
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ColisCreatePage;