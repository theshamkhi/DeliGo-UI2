import React, { useEffect, useState } from 'react';
import { clientService } from '../../services/clientService';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { Client } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { page, size, goToPage, changeSize } = usePagination();

    useEffect(() => {
        loadClients();
    }, [page, size, searchTerm]);

    const loadClients = async () => {
        try {
            setIsLoading(true);

            const data = searchTerm
                ? await clientService.search({ keyword: searchTerm, page, size })
                : await clientService.getAll({ page, size });

            setClients(Array.isArray(data?.content) ? data.content : []);
            setTotalElements(data?.totalElements ?? 0);
            setTotalPages(data?.totalPages ?? 0);
        } catch (error) {
            console.error('Failed to load clients:', error);
            setClients([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingClient(null);
        setShowModal(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            try {
                await clientService.delete(id);
                loadClients();
            } catch (error) {
                console.error('Failed to delete client:', error);
            }
        }
    };

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>Gestion des Clients</h1>
                    <p className="page-subtitle">{totalElements} clients au total</p>
                </div>
                <Button variant="primary" onClick={handleCreate}>
                    + Nouveau Client
                </Button>
            </div>

            <Card padding="none">
                <div className="colis-filters">
                    <Input
                        placeholder="Rechercher par nom, email, téléphone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div style={{ padding: '3rem' }}>
                        <Loading />
                    </div>
                ) : clients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏢</div>
                        <h3>Aucun client trouvé</h3>
                        <p>Commencez par créer votre premier client</p>
                        <Button variant="primary" onClick={handleCreate}>
                            Créer un Client
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Adresse</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>{client.nom}</td>
                                        <td>{client.prenom}</td>
                                        <td>{client.email}</td>
                                        <td>{client.telephone}</td>
                                        <td>
                                            <div className="description-cell">{client.adresse}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button size="small" variant="outline" onClick={() => handleEdit(client)}>
                                                    Modifier
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="danger"
                                                    onClick={() => handleDelete(client.id)}
                                                >
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

export default ClientsPage;