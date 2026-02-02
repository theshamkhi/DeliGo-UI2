import React, { useEffect, useState } from 'react';
import { zoneService } from '../../services/zoneService';
import { livreurService } from '../../services/livreurService';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { Livreur, CreateLivreurData, Zone } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const LivreursPage: React.FC = () => {
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Livreur | null>(null);
    const { page, size, goToPage, changeSize } = usePagination();

    useEffect(() => {
        loadData();
        loadZones();
    }, [page, size]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await livreurService.getAll({ page, size });
            setLivreurs(data.content);
            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to load livreurs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadZones = async () => {
        try {
            const data = await zoneService.getAll({ page: 0, size: 100 });
            setZones(data.content);
        } catch (error) {
            console.error('Failed to load zones:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr ?')) {
            try {
                await livreurService.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>Gestion des Livreurs</h1>
                    <p className="page-subtitle">{totalElements} livreurs</p>
                </div>
                <Button variant="primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
                    + Nouveau Livreur
                </Button>
            </div>

            <Card padding="none">
                {isLoading ? (
                    <div style={{ padding: '3rem' }}><Loading /></div>
                ) : livreurs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚚</div>
                        <h3>Aucun livreur</h3>
                        <Button variant="primary" onClick={() => setShowModal(true)}>Créer</Button>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Téléphone</th>
                                    <th>Véhicule</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {livreurs.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nom}</td>
                                        <td>{item.prenom}</td>
                                        <td>{item.telephone}</td>
                                        <td>{item.vehicule}</td>
                                        <td>
                        <span className={item.actif ? 'status-badge' : 'priority-badge'}
                              style={{ backgroundColor: item.actif ? 'var(--success-main)' : 'var(--gray-400)', color: 'white' }}>
                          {item.actif ? 'Actif' : 'Inactif'}
                        </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button size="small" variant="outline" onClick={() => { setEditingItem(item); setShowModal(true); }}>
                                                    Modifier
                                                </Button>
                                                <Button size="small" variant="danger" onClick={() => handleDelete(item.id)}>
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            pageSize={size}
                            totalElements={totalElements}
                            onPageChange={goToPage}
                            onPageSizeChange={changeSize}
                        />
                    </>
                )}
            </Card>

            <LivreurModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={editingItem}
                zones={zones}
                onSuccess={() => { setShowModal(false); loadData(); }}
            />
        </div>
    );
};

const LivreurModal: React.FC<any> = ({ isOpen, onClose, item, zones, onSuccess }) => {
    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
        useForm<CreateLivreurData>({
            initialValues: {
                nom: item?.nom || '',
                prenom: item?.prenom || '',
                telephone: item?.telephone || '',
                vehicule: item?.vehicule || '',
                zoneAssigneeId: item?.zoneAssigneeId || '',
                actif: item?.actif ?? true,
            },
            validationRules: {
                nom: validators.required(),
                prenom: validators.required(),
                telephone: validators.compose(validators.required(), validators.phoneNumber()),
                vehicule: validators.required(),
            },
            onSubmit: async (formValues) => {
                if (item) {
                    await livreurService.update(item.id, formValues);
                } else {
                    await livreurService.create(formValues);
                }
                onSuccess();
            },
        });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Modifier' : 'Nouveau Livreur'}>
            <form onSubmit={handleSubmit}>
                <Input name="nom" label="Nom" value={values.nom} onChange={handleChange} onBlur={handleBlur} error={touched.nom ? errors.nom : undefined} required />
                <Input name="prenom" label="Prénom" value={values.prenom} onChange={handleChange} onBlur={handleBlur} error={touched.prenom ? errors.prenom : undefined} required />
                <Input name="telephone" label="Téléphone" value={values.telephone} onChange={handleChange} onBlur={handleBlur} error={touched.telephone ? errors.telephone : undefined} required />
                <Input name="vehicule" label="Véhicule" value={values.vehicule} onChange={handleChange} onBlur={handleBlur} error={touched.vehicule ? errors.vehicule : undefined} required />
                <Select
                    name="zoneAssigneeId"
                    label="Zone Assignée"
                    value={values.zoneAssigneeId || ''}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Aucune zone' },
                        ...zones.map((z: { id: any; nom: any; ville: any; }) => ({ value: z.id, label: `${z.nom} - ${z.ville}` }))
                    ]}
                />
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        <input
                            type="checkbox"
                            name="actif"
                            checked={values.actif}
                            onChange={handleChange}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Actif
                    </label>
                </div>
                <div className="form-actions">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>{item ? 'Modifier' : 'Créer'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LivreursPage;