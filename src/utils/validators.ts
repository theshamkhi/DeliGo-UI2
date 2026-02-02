export const validators = {
    required: (message = 'Ce champ est requis') => (value: any) => {
        if (value === null || value === undefined || value === '') {
            return message;
        }
        if (typeof value === 'string' && value.trim() === '') {
            return message;
        }
        return undefined;
    },

    email: (message = 'Email invalide') => (value: string) => {
        if (!value) return undefined;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? undefined : message;
    },

    minLength: (min: number, message?: string) => (value: string) => {
        if (!value) return undefined;
        return value.length >= min
            ? undefined
            : message || `Minimum ${min} caractères requis`;
    },

    maxLength: (max: number, message?: string) => (value: string) => {
        if (!value) return undefined;
        return value.length <= max
            ? undefined
            : message || `Maximum ${max} caractères autorisés`;
    },

    min: (min: number, message?: string) => (value: number) => {
        if (value === null || value === undefined) return undefined;
        return value >= min
            ? undefined
            : message || `La valeur minimum est ${min}`;
    },

    max: (max: number, message?: string) => (value: number) => {
        if (value === null || value === undefined) return undefined;
        return value <= max
            ? undefined
            : message || `La valeur maximum est ${max}`;
    },

    phoneNumber: (message = 'Numéro de téléphone invalide') => (value: string) => {
        if (!value) return undefined;
        // Moroccan phone number format
        const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
        return phoneRegex.test(value.replace(/\s/g, '')) ? undefined : message;
    },

    pattern: (regex: RegExp, message: string) => (value: string) => {
        if (!value) return undefined;
        return regex.test(value) ? undefined : message;
    },

    match: (fieldName: string, message?: string) => (value: any, values: any) => {
        return value === values[fieldName]
            ? undefined
            : message || `Les champs ne correspondent pas`;
    },

    compose: (...validators: Array<(value: any) => string | undefined>) => (value: any) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return undefined;
    },
};

// Common validation rules
export const commonValidations = {
    username: validators.compose(
        validators.required(),
        validators.minLength(3),
        validators.maxLength(20)
    ),

    password: validators.compose(
        validators.required(),
        validators.minLength(8, 'Le mot de passe doit contenir au moins 8 caractères')
    ),

    email: validators.compose(
        validators.required(),
        validators.email()
    ),

    phone: validators.compose(
        validators.required(),
        validators.phoneNumber()
    ),

    postalCode: validators.compose(
        validators.required(),
        validators.pattern(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    ),
};