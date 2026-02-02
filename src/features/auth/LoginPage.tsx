import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { login, clearError } from '../../store/slices/authSlice';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { validators } from '../../utils/validators';
import './AuthPages.css';

interface LoginFormValues {
    username: string;
    password: string;
}

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, error, isLoading } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm<LoginFormValues>({
        initialValues: {
            username: '',
            password: '',
        },
        validationRules: {
            username: validators.required('Nom d\'utilisateur requis'),
            password: validators.required('Mot de passe requis'),
        },
        onSubmit: async (formValues) => {
            await dispatch(login(formValues)).unwrap();
        },
    });

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="logo-icon">📦</div>
                    <h1>DeliGo</h1>
                    <p>Gestion de Livraison Intelligente</p>
                </div>

                <Card className="auth-card">
                    <h2 className="auth-title">Connexion</h2>
                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            label="Nom d'utilisateur"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.username ? errors.username : undefined}
                            required
                            autoComplete="username"
                        />

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            label="Mot de passe"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password ? errors.password : undefined}
                            required
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading || isSubmitting}
                        >
                            Se connecter
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>Pas encore de compte?</p>
                        <Link to="/register" className="auth-link">
                            S'inscrire
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};