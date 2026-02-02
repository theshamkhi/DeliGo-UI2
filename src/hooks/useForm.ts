import { useState, ChangeEvent, FormEvent } from 'react';

interface ValidationRules<T> {
    [key: string]: (value: any, values: T) => string | undefined;
}

interface UseFormProps<T> {
    initialValues: T;
    validationRules?: ValidationRules<T>;
    onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
                                                           initialValues,
                                                           validationRules = {},
                                                           onSubmit,
                                                       }: UseFormProps<T>) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (fieldName?: keyof T): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        const fieldsToValidate = fieldName ? [fieldName] : Object.keys(validationRules);

        fieldsToValidate.forEach((field) => {
            const validator = validationRules[field as string];
            if (validator) {
                const error = validator(values[field as string], values);
                if (error) {
                    newErrors[field as keyof T] = error;
                    isValid = false;
                }
            }
        });

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setValues((prev) => ({ ...prev, [name]: newValue }));

        // Clear error when user starts typing
        if (errors[name as keyof T]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validate(name as keyof T);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {} as Record<keyof T, boolean>
        );
        setTouched(allTouched);

        // Validate all fields
        const isValid = validate();

        if (isValid) {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    };

    const setFieldValue = (name: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const setFieldError = (name: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        validate,
    };
};