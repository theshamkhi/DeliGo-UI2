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
import { Livreur, Zone } from '../../types';
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

            setLivreurs(Array.isArray(data?.content) ? data.content : []);
            setTotalElements(data?.totalElements ?? 0);
            setTotalPages(data?.totalPages ?? 0);
        } catch (error) {
            console.error('Failed to load livreurs:', error);
            setLivreurs([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const loadZones = async () => {
        try {
            const data = await zoneService.getAll({ page: 0, size: 100 });
            setZones(Array.isArray(data?.content) ? data.content : []);
        } catch (error) {
            console.error('Failed to load zones:', error);
            setZones([]);
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
        </div>
    );
};

export default LivreursPage;