/**
 * Shared Settings Form Types
 *
 * Common types and interfaces used across all settings forms
 * to eliminate duplication and ensure consistency.
 */

import type { UseFormReturn, FieldValues } from "react-hook-form";

/**
 * Base props for all settings form components
 */
export interface BaseSettingsFormProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    className?: string;
}

/**
 * Props for settings forms that need field change handling
 */
export interface SettingsFormWithFieldChangeProps<T extends FieldValues>
    extends BaseSettingsFormProps<T> {
    handleFieldChange: (field: keyof T, value: unknown) => void;
}

/**
 * Props for settings forms that need update functions
 */
export interface SettingsFormWithUpdateProps<T extends FieldValues>
    extends BaseSettingsFormProps<T> {
    updateSettings: (settings: Partial<T>) => void;
}

/**
 * Common form field change handler type
 */
export type FieldChangeHandler<T extends FieldValues> = (
    field: keyof T,
    value: unknown,
) => void;

/**
 * Common settings update function type
 */
export type SettingsUpdateFunction<T extends FieldValues> = (
    settings: Partial<T>,
) => void;

/**
 * Common form section props
 */
export interface FormSectionProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

/**
 * Common form field props
 */
export interface FormFieldProps<T extends FieldValues> {
    name: keyof T;
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

/**
 * Select field options
 */
export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

/**
 * Common validation error type
 */
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

/**
 * Form state type
 */
export interface FormState {
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
    errors: Record<string, ValidationError>;
}
