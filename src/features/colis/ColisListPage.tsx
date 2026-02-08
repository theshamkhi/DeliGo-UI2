import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchColis, searchColis } from '../../store/slices/colisSlice';
import { usePagination } from '../../hooks/usePagination';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import {
    getStatutLabel,
    getStatutColor,
    getPrioriteLabel,
    formatDate,
} from '../../utils/formatters';
import './ColisPages.css';

const ColisListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const {
        colis = [],
        pagination = { totalElements: 0, totalPages: 0 },
        isLoading = false,
    } = useAppSelector((state) => state.colis);

    const { isManager, isClient } = useAuth();
    const { page, size, goToPage, changeSize } = usePagination();
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Clean debounce without state
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(searchColis({ keyword: searchTerm, page, size }));
            } else {
                dispatch(fetchColis({ page, size, sort: 'dateCreation,desc' }));
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [dispatch, page, size, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>Gestion des Colis</h1>
                    <p className="page-subtitle">
                        {pagination.totalElements} colis au total
                    </p>
                </div>

                {(isManager || isClient) && (
                    <Button variant="primary" onClick={() => navigate('/colis/create')}>
                        + Nouveau Colis
                    </Button>
                )}
            </div>

            <Card padding="none">
                <div className="colis-filters">
                    <Input
                        placeholder="Rechercher par description, ville, destinataire..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {isLoading ? (
                    <div style={{ padding: '3rem' }}>
                        <Loading message="Chargement des colis..." />
                    </div>
                ) : colis.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>Aucun colis trouvé</h3>
                        <p>
                            {searchTerm
                                ? 'Essayez de modifier votre recherche'
                                : 'Commencez par créer votre premier colis'}
                        </p>

                        {(isManager || isClient) && !searchTerm && (
                            <Button
                                variant="primary"
                                onClick={() => navigate('/colis/create')}
                            >
                                Créer un Colis
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Description</th>
                                    <th>Destination</th>
                                    <th>Poids</th>
                                    <th>Priorité</th>
                                    <th>Statut</th>
                                    <th>Date création</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {colis.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                        <span className="ref-code">
                          {c.id.substring(0, 8).toUpperCase()}
                        </span>
                                        </td>
                                        <td>
                                            <div className="description-cell">
                                                {c.description}
                                            </div>
                                        </td>
                                        <td>{c.villeDestination}</td>
                                        <td>{c.poids} kg</td>
                                        <td>
                        <span
                            className="priority-badge"
                            data-priority={c.priorite.toLowerCase()}
                        >
                          {getPrioriteLabel(c.priorite)}
                        </span>
                                        </td>
                                        <td>
                        <span
                            className="status-badge"
                            style={{
                                backgroundColor: getStatutColor(c.statut),
                                color: 'white',
                            }}
                        >
                          {getStatutLabel(c.statut)}
                        </span>
                                        </td>
                                        <td>{formatDate(c.dateCreation)}</td>
                                        <td>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => navigate(`/colis/${c.id}`)}
                                            >
                                                Détails
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={pagination.totalPages}
                            pageSize={size}
                            totalElements={pagination.totalElements}
                            onPageChange={goToPage}
                            onPageSizeChange={changeSize}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default ColisListPage;