import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchColisById, updateColis } from '../../store/slices/colisSlice';
import { zoneService } from '../../services/zoneService';
import { livreurService } from '../../services/livreurService';
import { useForm } from '../../hooks/useForm';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import {
    ColisPriorite,
    ColisStatut,
    Livreur,
    Zone,
    UpdateColisData,
} from '../../types';
import { validators } from '../../utils/validators';
import './ColisPages.css';

const ColisEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { selectedColis, isLoading } = useAppSelector(
        (state) => state.colis
    );

    const [error, setError] = useState<string | null>(null);
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    /* ---------------------------------- LOAD COLIS ---------------------------------- */
    useEffect(() => {
        if (id) {
            dispatch(fetchColisById(id));
        }
    }, [dispatch, id]);

    /* ------------------------------ LOAD LIVREURS + ZONES ------------------------------ */
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);
                const [livreursData, zonesData] = await Promise.all([
                    livreurService.getActifs(),
                    zoneService.getAll({ page: 0, size: 100 }),
                ]);

                setLivreurs(livreursData);
                setZones(Array.isArray(zonesData.content) ? zonesData.content : []);
            } catch {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    /* ---------------------------- FORM INITIAL VALUES ---------------------------- */
    const initialValues: UpdateColisData = selectedColis
        ? {
            description: selectedColis.description,
            poids: selectedColis.poids,
            priorite: selectedColis.priorite,
            statut: selectedColis.statut,
            villeDestination: selectedColis.villeDestination,
            livreurId: selectedColis.livreurId || '',
            zoneId: selectedColis.zoneId || '',
            dateLimiteLivraison: selectedColis.dateLimiteLivraison
                ? new Date(selectedColis.dateLimiteLivraison)
                    .toISOString()
                    .slice(0, 16)
                : '',
            commentaire: selectedColis.commentaire || '',
        }
        : {
            description: '',
            poids: 0,
            priorite: ColisPriorite.NORMALE,
            statut: ColisStatut.CREE,
            villeDestination: '',
            livreurId: '',
            zoneId: '',
            dateLimiteLivraison: '',
            commentaire: '',
        };

    /* ------------------------------------ FORM ------------------------------------ */
    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm<UpdateColisData>({
        initialValues,
        validationRules: {
            description: validators.required('La description est requise'),
            poids: validators.compose(
                validators.required('Le poids est requis'),
                validators.min(0.1, 'Le poids doit être supérieur à 0')
            ),
            villeDestination: validators.required(
                'La ville de destination est requise'
            ),
        },
        onSubmit: async (formValues) => {
            if (!id) return;

            try {
                setError(null);
                await dispatch(
                    updateColis({
                        id,
                        data: {
                            ...formValues,
                            livreurId: formValues.livreurId || undefined,
                            zoneId: formValues.zoneId || undefined,
                            dateLimiteLivraison:
                                formValues.dateLimiteLivraison || undefined,
                        },
                    })
                ).unwrap();

                navigate(`/colis/${id}`);
            } catch (err: any) {
                setError(
                    err?.message || 'Erreur lors de la mise à jour du colis'
                );
            }
        },
    });

    /* ---------------------------------- STATES ---------------------------------- */
    if (isLoading || loadingData) {
        return <Loading fullScreen />;
    }

    if (!selectedColis) {
        return (
            <div className="error-container">
                <h2>Colis non trouvé</h2>
                <Button onClick={() => navigate('/colis')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    /* ---------------------------------- RENDER ---------------------------------- */
    return (
        <div className="colis-create-container">
            <div className="page-header">
                <h1>Modifier le Colis</h1>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/colis/${id}`)}
                >
                    Annuler
                </Button>
            </div>

            {error && (
                <div className="error-alert">
                    <strong>Erreur :</strong> {error}
                </div>
            )}

            <Card padding="large" key={selectedColis.id}>
                <form onSubmit={handleSubmit} className="colis-form">
                    <div className="form-grid">
                        <Input
                            name="description"
                            label="Description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                                touched.description
                                    ? errors.description
                                    : undefined
                            }
                            required
                        />

                        <Input
                            name="poids"
                            label="Poids (kg)"
                            type="number"
                            step="0.01"
                            value={values.poids.toString()}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                                touched.poids ? errors.poids : undefined
                            }
                            required
                        />

                        <Select
                            name="priorite"
                            label="Priorité"
                            value={values.priorite}
                            onChange={handleChange}
                            options={[
                                {
                                    value: ColisPriorite.NORMALE,
                                    label: 'Normale',
                                },
                                {
                                    value: ColisPriorite.HAUTE,
                                    label: 'Haute',
                                },
                                {
                                    value: ColisPriorite.URGENTE,
                                    label: 'Urgente',
                                },
                            ]}
                        />

                        <Select
                            name="statut"
                            label="Statut"
                            value={values.statut}
                            onChange={handleChange}
                            options={Object.values(ColisStatut).map((s) => ({
                                value: s,
                                label: s,
                            }))}
                        />

                        <Input
                            name="villeDestination"
                            label="Ville de Destination"
                            value={values.villeDestination}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                                touched.villeDestination
                                    ? errors.villeDestination
                                    : undefined
                            }
                            required
                        />

                        <Input
                            name="dateLimiteLivraison"
                            label="Date Limite de Livraison"
                            type="datetime-local"
                            value={values.dateLimiteLivraison}
                            onChange={handleChange}
                        />

                        {/* -------- LIVREUR -------- */}
                        <div>
                            <Select
                                name="livreurId"
                                label="Livreur Assigné"
                                value={values.livreurId}
                                onChange={handleChange}
                                options={[
                                    {
                                        value: '',
                                        label:
                                            '-- Aucun livreur (à assigner) --',
                                    },
                                    ...livreurs.map((l) => ({
                                        value: l.id,
                                        label: `${l.prenom} ${l.nom} - ${l.vehicule}`,
                                    })),
                                ]}
                            />
                            <small className="helper-text">
                                {values.livreurId
                                    ? '✓ Livreur assigné'
                                    : '⚠️ Aucun livreur assigné'}
                            </small>
                        </div>

                        {/* -------- ZONE -------- */}
                        <div>
                            <Select
                                name="zoneId"
                                label="Zone de Livraison"
                                value={values.zoneId}
                                onChange={handleChange}
                                options={[
                                    { value: '', label: 'Aucune zone' },
                                    ...(Array.isArray(zones)
                                        ? zones.map((z) => ({
                                            value: z.id,
                                            label: `${z.nom} - ${z.ville}`,
                                        }))
                                        : []),
                                ]}
                            />
                            <small className="helper-text">
                                Optionnel – organisation des tournées
                            </small>
                        </div>

                        <div className="form-section full-width">
                            <label>Commentaire</label>
                            <textarea
                                name="commentaire"
                                className="input"
                                value={values.commentaire}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/colis/${id}`)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ColisEditPage;