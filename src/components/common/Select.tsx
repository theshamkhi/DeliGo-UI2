import React from 'react';
import './Select.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
                                                  label,
                                                  error,
                                                  options,
                                                  placeholder,
                                                  className = '',
                                                  ...props
                                              }) => {
    return (
        <div className={`select-wrapper ${className}`}>
            {label && (
                <label htmlFor={props.id} className="select-label">
                    {label}
                    {props.required && <span className="select-required">*</span>}
                </label>
            )}
            <select
                className={`select ${error ? 'select-error' : ''}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="select-error-message">{error}</span>}
        </div>
    );
};