import React, { useEffect, useState } from 'react';
import { destinataireService } from '../../services/destinataireService';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { Destinataire, CreateDestinataireData } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const DestinatairesPage: React.FC = () => {
  const [destinataires, setDestinataires] = useState<Destinataire[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Destinataire | null>(null);
  const { page, size, goToPage, changeSize } = usePagination();

  useEffect(() => {
    loadData();
  }, [page, size]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await destinataireService.getAll({ page, size });
      setDestinataires(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load destinataires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce destinataire ?')) {
      try {
        await destinataireService.delete(id);
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
          <h1>Gestion des Destinataires</h1>
          <p className="page-subtitle">{totalElements} destinataires</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + Nouveau Destinataire
        </Button>
      </div>

      <Card padding="none">
        {isLoading ? (
          <div style={{ padding: '3rem' }}><Loading /></div>
        ) : destinataires.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Aucun destinataire</h3>
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
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinataires.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nom}</td>
                      <td>{item.prenom}</td>
                      <td>{item.email}</td>
                      <td>{item.telephone}</td>
                      <td><div className="description-cell">{item.adresse}</div></td>
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

      <DestinataireModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={editingItem}
        onSuccess={() => { setShowModal(false); loadData(); }}
      />
    </div>
  );
};

const DestinataireModal: React.FC<any> = ({ isOpen, onClose, item, onSuccess }) => {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<CreateDestinataireData>({
      initialValues: {
        nom: item?.nom || '',
        prenom: item?.prenom || '',
        email: item?.email || '',
        telephone: item?.telephone || '',
        adresse: item?.adresse || '',
      },
      validationRules: {
        nom: validators.required(),
        prenom: validators.required(),
        email: validators.compose(validators.required(), validators.email()),
        telephone: validators.compose(validators.required(), validators.phoneNumber()),
        adresse: validators.required(),
      },
      onSubmit: async (formValues) => {
        if (item) {
          await destinataireService.update(item.id, formValues);
        } else {
          await destinataireService.create(formValues);
        }
        onSuccess();
      },
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Modifier' : 'Nouveau Destinataire'}>
      <form onSubmit={handleSubmit}>
        <Input name="nom" label="Nom" value={values.nom} onChange={handleChange} onBlur={handleBlur} error={touched.nom ? errors.nom : undefined} required />
        <Input name="prenom" label="Prénom" value={values.prenom} onChange={handleChange} onBlur={handleBlur} error={touched.prenom ? errors.prenom : undefined} required />
        <Input name="email" label="Email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} required />
        <Input name="telephone" label="Téléphone" value={values.telephone} onChange={handleChange} onBlur={handleBlur} error={touched.telephone ? errors.telephone : undefined} required />
        <Input name="adresse" label="Adresse" value={values.adresse} onChange={handleChange} onBlur={handleBlur} error={touched.adresse ? errors.adresse : undefined} required />
        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>{item ? 'Modifier' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default DestinatairesPage;