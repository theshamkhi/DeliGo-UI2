import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { zoneService } from '../../services';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { useForm } from '../../hooks/useForm';
import { User, RegisterData, Zone, UserRole } from '../../types';
import { validators } from '../../utils/validators';
import '../colis/ColisPages.css';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filterRole, setFilterRole] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, [filterRole]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = filterRole === 'ALL'
                ? await adminService.getUsers()
                : await adminService.getUsersByRole(filterRole);
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        const action = user.actif ? 'désactiver' : 'activer';
        if (window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
            try {
                if (user.actif) {
                    await adminService.deactivateUser(user.id);
                } else {
                    await adminService.activateUser(user.id);
                }
                loadUsers();
            } catch (error) {
                console.error('Failed to toggle user status:', error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            try {
                await adminService.deleteUser(id);
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const getRoleBadgeColor = (role: string): string => {
        switch (role) {
            case 'ROLE_MANAGER':
                return '#2563eb'; // Blue
            case 'ROLE_LIVREUR':
                return '#16a34a'; // Green
            case 'ROLE_CLIENT':
                return '#9333ea'; // Purple
            default:
                return '#6b7280'; // Gray
        }
    };

    const getRoleLabel = (role: string): string => {
        return role.replace('ROLE_', '');
    };

    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.username.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.nom.toLowerCase().includes(search) ||
            user.prenom.toLowerCase().includes(search)
        );
    });

    return (
        <div className="colis-list-container">
            <div className="page-header">
                <div>
                    <h1>Gestion des Utilisateurs</h1>
                    <p className="page-subtitle">{users.length} utilisateurs au total</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingUser(null);
                        setShowModal(true);
                    }}
                >
                    + Nouvel Utilisateur
                </Button>
            </div>

            <Card padding="none">
                <div className="colis-filters">
                    <Input
                        placeholder="Rechercher par nom, email, username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['ALL', 'ROLE_MANAGER', 'ROLE_LIVREUR', 'ROLE_CLIENT'].map((role) => (
                            <Button
                                key={role}
                                size="small"
                                variant={filterRole === role ? 'primary' : 'outline'}
                                onClick={() => setFilterRole(role)}
                            >
                                {role === 'ALL' ? 'Tous' : getRoleLabel(role)}
                            </Button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '3rem' }}>
                        <Loading />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Aucun utilisateur trouvé</h3>
                        <p>
                            {searchTerm
                                ? 'Essayez de modifier votre recherche'
                                : 'Commencez par créer votre premier utilisateur'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Username</th>
                                <th>Nom Complet</th>
                                <th>Email</th>
                                <th>Rôles</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <strong>{user.username}</strong>
                                    </td>
                                    <td>
                                        {user.prenom} {user.nom}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="status-badge"
                                                        style={{
                                                            backgroundColor: getRoleBadgeColor(role),
                                                            color: 'white',
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                        }}
                                                    >
                                                        {getRoleLabel(role)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                    Aucun rôle
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: user.actif
                                                    ? 'var(--success-100)'
                                                    : 'var(--danger-100)',
                                                color: user.actif
                                                    ? 'var(--success-700)'
                                                    : 'var(--danger-700)',
                                            }}
                                        >
                                            {user.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setShowModal(true);
                                                }}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                size="small"
                                                variant={user.actif ? 'secondary' : 'success'}
                                                onClick={() => handleToggleStatus(user)}
                                            >
                                                {user.actif ? 'Désactiver' : 'Activer'}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="danger"
                                                onClick={() => handleDelete(user.id)}
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
                )}
            </Card>

            <UserModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                user={editingUser}
                onSuccess={() => {
                    setShowModal(false);
                    loadUsers();
                }}
            />
        </div>
    );
};

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const isEditing = !!user;
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>(
        user?.roles[0] || UserRole.MANAGER
    );

    useEffect(() => {
        if (isOpen) {
            loadZones();
            if (user) {
                setSelectedRole(user.roles[0]);
            }
        }
    }, [isOpen, user]);

    const loadZones = async () => {
        try {
            const data = await zoneService.getAll({ page: 0, size: 100 });
            setZones(data.content || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
        }
    };

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
    } = useForm<RegisterData>({
        initialValues: {
            username: user?.username || '',
            password: '',
            email: user?.email || '',
            nom: user?.nom || '',
            prenom: user?.prenom || '',
            telephone: user?.telephone || '',
            roles: user?.roles || [UserRole.MANAGER],
            livreurData: user?.livreurId
                ? {
                    vehicule: '',
                    zoneAssigneeId: undefined,
                    actif: true,
                }
                : undefined,
            clientData: user?.clientExpediteurId
                ? {
                    adresse: '',
                }
                : undefined,
        },
        validationRules: {
            username: validators.required('Le nom d\'utilisateur est requis'),
            password: isEditing
                ? () => undefined
                : validators.compose(
                    validators.required('Le mot de passe est requis'),
                    validators.minLength(6, 'Au moins 6 caractères')
                ),
            email: validators.compose(validators.required(), validators.email()),
            nom: validators.required(),
            prenom: validators.required(),
            telephone: validators.phoneNumber(),
        },
        onSubmit: async (formValues) => {
            try {
                // Clean up the data based on selected role
                const submitData: RegisterData = {
                    ...formValues,
                    roles: [selectedRole],
                };

                // Add nested data based on role
                if (selectedRole === UserRole.LIVREUR) {
                    if (!formValues.livreurData?.vehicule) {
                        alert('Le véhicule est requis pour un livreur');
                        return;
                    }
                    submitData.livreurData = formValues.livreurData;
                    submitData.clientData = undefined;
                } else if (selectedRole === UserRole.CLIENT) {
                    if (!formValues.clientData?.adresse) {
                        alert('L\'adresse est requise pour un client');
                        return;
                    }
                    submitData.clientData = formValues.clientData;
                    submitData.livreurData = undefined;
                } else {
                    // Manager - no nested data needed
                    submitData.livreurData = undefined;
                    submitData.clientData = undefined;
                }

                if (isEditing && user) {
                    await adminService.updateUser(user.id, submitData);
                } else {
                    await adminService.createUser(submitData);
                }
                onSuccess();
            } catch (error) {
                console.error('Failed to save user:', error);
            }
        },
    });

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setFieldValue('roles', [role]);

        // Initialize nested data based on role
        if (role === UserRole.LIVREUR) {
            setFieldValue('livreurData', {
                vehicule: '',
                zoneAssigneeId: undefined,
                actif: true,
            });
            setFieldValue('clientData', undefined);
        } else if (role === UserRole.CLIENT) {
            setFieldValue('clientData', {
                adresse: '',
            });
            setFieldValue('livreurData', undefined);
        } else {
            setFieldValue('livreurData', undefined);
            setFieldValue('clientData', undefined);
        }
    };

    // Handler for nested livreur data changes
    const handleLivreurDataChange = (field: string, value: any) => {
        setFieldValue('livreurData', {
            ...values.livreurData,
            [field]: value,
        });
    };

    // Handler for nested client data changes
    const handleClientDataChange = (field: string, value: any) => {
        setFieldValue('clientData', {
            ...values.clientData,
            [field]: value,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
            size="large"
        >
            <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Type d'utilisateur *
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { value: UserRole.MANAGER, label: 'Manager' },
                            { value: UserRole.LIVREUR, label: 'Livreur' },
                            { value: UserRole.CLIENT, label: 'Client' },
                        ].map((role) => (
                            <Button
                                key={role.value}
                                type="button"
                                variant={selectedRole === role.value ? 'primary' : 'outline'}
                                onClick={() => handleRoleChange(role.value)}
                                disabled={isEditing}
                            >
                                {role.label}
                            </Button>
                        ))}
                    </div>
                    {isEditing && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Le type d'utilisateur ne peut pas être modifié
                        </p>
                    )}
                </div>

                {/* User Credentials */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        name="username"
                        label="Nom d'utilisateur"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.username ? errors.username : undefined}
                        required
                        disabled={isEditing}
                    />
                    <Input
                        name="password"
                        label={isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password ? errors.password : undefined}
                        required={!isEditing}
                    />
                </div>

                <Input
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email ? errors.email : undefined}
                    required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        name="nom"
                        label="Nom"
                        value={values.nom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.nom ? errors.nom : undefined}
                        required
                    />
                    <Input
                        name="prenom"
                        label="Prénom"
                        value={values.prenom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.prenom ? errors.prenom : undefined}
                        required
                    />
                </div>

                <Input
                    name="telephone"
                    label="Téléphone"
                    placeholder="+212612345678"
                    value={values.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.telephone ? errors.telephone : undefined}
                />

                {/* Livreur-specific fields */}
                {selectedRole === UserRole.LIVREUR && (
                    <>
                        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                        <h3 style={{ marginBottom: '1rem' }}>Informations Livreur</h3>

                        <Input
                            name="livreurData.vehicule"
                            label="Véhicule"
                            placeholder="Ex: Renault Kangoo"
                            value={values.livreurData?.vehicule || ''}
                            onChange={(e) => handleLivreurDataChange('vehicule', e.target.value)}
                            required
                        />

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Zone Assignée
                            </label>
                            <select
                                name="livreurData.zoneAssigneeId"
                                value={values.livreurData?.zoneAssigneeId || ''}
                                onChange={(e) => handleLivreurDataChange('zoneAssigneeId', e.target.value || undefined)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                }}
                            >
                                <option value="">Aucune zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.nom} - {zone.ville}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Client-specific fields */}
                {selectedRole === UserRole.CLIENT && (
                    <>
                        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                        <h3 style={{ marginBottom: '1rem' }}>Informations Client</h3>

                        <Input
                            name="clientData.adresse"
                            label="Adresse"
                            placeholder="Ex: 123 Rue Mohammed V, Casablanca"
                            value={values.clientData?.adresse || ''}
                            onChange={(e) => handleClientDataChange('adresse', e.target.value)}
                            required
                        />
                    </>
                )}

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {isEditing ? 'Modifier' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminUsersPage;