import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { getInitials } from '../../utils/formatters';
import '../colis/ColisPages.css';

const ProfilePage: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [profile, setProfile] = useState(user);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    if (isLoading || !profile) {
        return <Loading fullScreen />;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>Mon Profil</h1>

            <Card padding="large">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {getInitials(profile.nom, profile.prenom)}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>
                            {profile.prenom} {profile.nom}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                            {profile.roles[0]?.replace('ROLE_', '')}
                        </p>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label>Nom d'utilisateur</label>
                        <span>{profile.username}</span>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <span>{profile.email}</span>
                    </div>
                    <div className="info-item">
                        <label>Nom</label>
                        <span>{profile.nom}</span>
                    </div>
                    <div className="info-item">
                        <label>Prénom</label>
                        <span>{profile.prenom}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Rôles</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {profile.roles.map((role) => (
                                <span
                                    key={role}
                                    className="status-badge"
                                    style={{ backgroundColor: 'var(--primary-600)', color: 'white' }}
                                >
                  {role.replace('ROLE_', '')}
                </span>
                            ))}
                        </div>
                    </div>
                    {profile.permissions && profile.permissions.length > 0 && (
                        <div className="info-item full-width">
                            <label>Permissions</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {profile.permissions.map((perm) => (
                                    <span
                                        key={perm}
                                        className="priority-badge"
                                        style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}
                                    >
                    {perm}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="outline" onClick={loadProfile}>
                        Actualiser
                    </Button>
                    <Button variant="secondary" disabled>
                        Modifier le Profil
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;