import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'medium',
                                                  fullWidth = false,
                                                  isLoading = false,
                                                  disabled,
                                                  children,
                                                  className = '',
                                                  ...props
                                              }) => {
    const classNames = [
        'button',
        `button-${variant}`,
        `button-${size}`,
        fullWidth && 'button-full-width',
        isLoading && 'button-loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="button-spinner"></span>
                    <span>Chargement...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};