import React, { useEffect, useState } from 'react';
import { zoneService } from '../../services/zoneService';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { Zone, CreateZoneData } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const ZonesPage: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Zone | null>(null);
    const { page, size, goToPage, changeSize } = usePagination();

    useEffect(() => {
        loadData();
    }, [page, size]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await zoneService.getAll({ page, size });
            setZones(data.content);
            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to load zones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr ?')) {
            try {
                await zoneService.delete(id);
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
                    <h1>Gestion des Zones</h1>
                    <p className="page-subtitle">{totalElements} zones</p>
                </div>
                <Button variant="primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
                    + Nouvelle Zone
                </Button>
            </div>

            <Card padding="none">
                {isLoading ? (
                    <div style={{ padding: '3rem' }}><Loading /></div>
                ) : zones.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗺️</div>
                        <h3>Aucune zone</h3>
                        <Button variant="primary" onClick={() => setShowModal(true)}>Créer</Button>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Ville</th>
                                    <th>Code Postal</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {zones.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nom}</td>
                                        <td>{item.ville}</td>
                                        <td>{item.codePostal}</td>
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

            <ZoneModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={editingItem}
                onSuccess={() => { setShowModal(false); loadData(); }}
            />
        </div>
    );
};

const ZoneModal: React.FC<any> = ({ isOpen, onClose, item, onSuccess }) => {
    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
        useForm<CreateZoneData>({
            initialValues: {
                nom: item?.nom || '',
                ville: item?.ville || '',
                codePostal: item?.codePostal || '',
            },
            validationRules: {
                nom: validators.required(),
                ville: validators.required(),
                codePostal: validators.compose(
                    validators.required(),
                    validators.pattern(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
                ),
            },
            onSubmit: async (formValues) => {
                if (item) {
                    await zoneService.update(item.id, formValues);
                } else {
                    await zoneService.create(formValues);
                }
                onSuccess();
            },
        });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Modifier' : 'Nouvelle Zone'}>
            <form onSubmit={handleSubmit}>
                <Input name="nom" label="Nom de la Zone" value={values.nom} onChange={handleChange} onBlur={handleBlur} error={touched.nom ? errors.nom : undefined} required />
                <Input name="ville" label="Ville" value={values.ville} onChange={handleChange} onBlur={handleBlur} error={touched.ville ? errors.ville : undefined} required />
                <Input name="codePostal" label="Code Postal" placeholder="20000" value={values.codePostal} onChange={handleChange} onBlur={handleBlur} error={touched.codePostal ? errors.codePostal : undefined} required />
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>{item ? 'Modifier' : 'Créer'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ZonesPage;