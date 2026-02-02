import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                helperText,
                                                className = '',
                                                ...props
                                            }) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label htmlFor={props.id} className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}
            <input
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
            {!error && helperText && <span className="input-helper-text">{helperText}</span>}
        </div>
    );
};