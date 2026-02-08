import React, { useEffect, useState } from 'react';
import { produitService } from '../../services/produitService';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { Produit, CreateProduitData } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const ProduitsPage: React.FC = () => {
    const [produits, setProduits] = useState<Produit[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Produit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { page, size, goToPage, changeSize } = usePagination();

    useEffect(() => {
        loadData();
    }, [page, size, searchTerm]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const data = searchTerm
                ? await produitService.search({ keyword: searchTerm, page, size })
                : await produitService.getAll({ page, size });

            setProduits(Array.isArray(data?.content) ? data.content : []);
            setTotalElements(data?.totalElements ?? 0);
            setTotalPages(data?.totalPages ?? 0);
        } catch (error) {
            console.error('Failed to load produits:', error);
            setProduits([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await produitService.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete produit:', error);
            }
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
        }).format(price);
    };

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>Catalogue Produits</h1>
                    <p className="page-subtitle">{totalElements} produits au total</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingItem(null);
                        setShowModal(true);
                    }}
                >
                    + Nouveau Produit
                </Button>
            </div>

            <Card padding="none">
                <div className="colis-filters">
                    <Input
                        placeholder="Rechercher par nom, catégorie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div style={{ padding: '3rem' }}>
                        <Loading />
                    </div>
                ) : produits.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>Aucun produit trouvé</h3>
                        <p>
                            {searchTerm
                                ? 'Essayez de modifier votre recherche'
                                : 'Commencez par créer votre premier produit'}
                        </p>
                        {!searchTerm && (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setEditingItem(null);
                                    setShowModal(true);
                                }}
                            >
                                Créer un Produit
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Catégorie</th>
                                    <th>Poids (kg)</th>
                                    <th>Prix</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {produits.map((produit) => (
                                    <tr key={produit.id}>
                                        <td>
                                            <div className="description-cell">
                                                {produit.nom}
                                            </div>
                                        </td>
                                        <td>
                                                <span
                                                    className="priority-badge"
                                                    style={{
                                                        backgroundColor: 'var(--primary-100)',
                                                        color: 'var(--primary-700)',
                                                    }}
                                                >
                                                    {produit.categorie}
                                                </span>
                                        </td>
                                        <td>{produit.poids} kg</td>
                                        <td>
                                            <strong>{formatPrice(produit.prix)}</strong>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button
                                                    size="small"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingItem(produit);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Modifier
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="danger"
                                                    onClick={() => handleDelete(produit.id)}
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

            <ProduitModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={editingItem}
                onSuccess={() => {
                    setShowModal(false);
                    loadData();
                }}
            />
        </div>
    );
};

interface ProduitModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Produit | null;
    onSuccess: () => void;
}

const ProduitModal: React.FC<ProduitModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       item,
                                                       onSuccess,
                                                   }) => {
    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm<CreateProduitData>({
        initialValues: {
            nom: item?.nom || '',
            categorie: item?.categorie || '',
            poids: item?.poids || 0,
            prix: item?.prix || 0,
        },
        validationRules: {
            nom: validators.required('Le nom est requis'),
            categorie: validators.required('La catégorie est requise'),
            poids: validators.compose(
                validators.required('Le poids est requis'),
                validators.min(0.01, 'Le poids doit être supérieur à 0')
            ),
            prix: validators.compose(
                validators.required('Le prix est requis'),
                validators.min(0.01, 'Le prix doit être supérieur à 0')
            ),
        },
        onSubmit: async (formValues) => {
            try {
                if (item) {
                    await produitService.update(item.id, formValues);
                } else {
                    await produitService.create(formValues);
                }
                onSuccess();
            } catch (error) {
                console.error('Failed to save produit:', error);
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={item ? 'Modifier le Produit' : 'Nouveau Produit'}
        >
            <form onSubmit={handleSubmit}>
                <Input
                    name="nom"
                    label="Nom du Produit"
                    placeholder="Ex: Laptop Dell XPS 15"
                    value={values.nom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.nom ? errors.nom : undefined}
                    required
                />

                <Input
                    name="categorie"
                    label="Catégorie"
                    placeholder="Ex: Électronique"
                    value={values.categorie}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.categorie ? errors.categorie : undefined}
                    required
                />

                <Input
                    name="poids"
                    label="Poids (kg)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={values.poids.toString()}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.poids ? errors.poids : undefined}
                    required
                />

                <Input
                    name="prix"
                    label="Prix (MAD)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={values.prix.toString()}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.prix ? errors.prix : undefined}
                    required
                />

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {item ? 'Modifier' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProduitsPage;