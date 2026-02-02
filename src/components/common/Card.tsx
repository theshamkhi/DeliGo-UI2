import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              title,
                                              subtitle,
                                              actions,
                                              className = '',
                                              padding = 'medium',
                                          }) => {
    return (
        <div className={`card card-padding-${padding} ${className}`}>
            {(title || subtitle || actions) && (
                <div className="card-header">
                    <div className="card-header-text">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-content">{children}</div>
        </div>
    );
};