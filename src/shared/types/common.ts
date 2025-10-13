/**
 * Common Type Definitions
 *
 * Shared types and interfaces used across the application to eliminate
 * duplication and ensure consistency.
 */

import type { UseFormReturn } from "react-hook-form";

// ============================================================================
// Form Types
// ============================================================================

/**
 * Base interface for all settings form props
 */
export interface BaseSettingsFormProps<T extends Record<string, unknown>> {
    form: UseFormReturn<T>;
}

/**
 * Common form field types
 */
export type FormFieldType = "text" | "number" | "email" | "password" | "url" | "tel";

/**
 * Common validation rules
 */
export interface ValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => boolean | string;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
    name: string;
    label: string;
    type: FormFieldType;
    description?: string;
    placeholder?: string;
    validation?: ValidationRules;
    options?: Array<{ value: string; label: string }>;
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Base interface for all settings categories
 */
export interface BaseSettings {
    [key: string]: unknown;
}

/**
 * Settings update operation
 */
export interface SettingsUpdate<T extends BaseSettings> {
    category: string;
    settings: Partial<T>;
    timestamp?: Date;
}

/**
 * Settings validation result
 */
export interface SettingsValidationResult {
    isValid: boolean;
    errors: Array<{
        field: string;
        message: string;
    }>;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base props for all settings form components
 */
export interface SettingsFormProps<T extends BaseSettings> extends BaseSettingsFormProps<T> {
    className?: string;
    onSubmit?: (data: T) => void | Promise<void>;
    onReset?: () => void;
    isLoading?: boolean;
    isDirty?: boolean;
}

/**
 * Base props for settings display components
 */
export interface SettingsDisplayProps<T extends BaseSettings> {
    settings: T;
    className?: string;
    showLabels?: boolean;
    compact?: boolean;
}

/**
 * Base props for settings cards
 */
export interface SettingsCardProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    className?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Base store state interface
 */
export interface BaseStoreState {
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

/**
 * Store action interface
 */
export interface StoreAction<T = unknown> {
    type: string;
    payload?: T;
    timestamp?: Date;
}

/**
 * Store selector function type
 */
export type StoreSelector<T, R> = (state: T) => R;

// ============================================================================
// API Types
// ============================================================================

/**
 * Base API response interface
 */
export interface BaseApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract the value type from a record
 */
export type ValueOf<T> = T[keyof T];

/**
 * Create a union type from object values
 */
export type ObjectValues<T> = T[keyof T];

/**
 * Create a union type from object keys
 */
export type ObjectKeys<T> = keyof T;

// ============================================================================
// Event Types
// ============================================================================

/**
 * Base event interface
 */
export interface BaseEvent {
    type: string;
    timestamp: Date;
    source: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

/**
 * Event listener configuration
 */
export interface EventListenerConfig {
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error interface
 */
export interface BaseError {
    name: string;
    message: string;
    code?: string | number;
    stack?: string;
    context?: Record<string, unknown>;
}

/**
 * Validation error interface
 */
export interface ValidationError extends BaseError {
    name: "ValidationError";
    field: string;
    value: unknown;
}

/**
 * Network error interface
 */
export interface NetworkError extends BaseError {
    name: "NetworkError";
    status?: number;
    statusText?: string;
    url?: string;
}

/**
 * Timeout error interface
 */
export interface TimeoutError extends BaseError {
    name: "TimeoutError";
    timeout: number;
    operation: string;
}

// ============================================================================
// Performance Types
// ============================================================================

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: Date;
    context?: Record<string, unknown>;
}

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage?: NodeJS.MemoryUsage;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Base configuration interface
 */
export interface BaseConfig {
    environment: "development" | "production" | "test";
    version: string;
    debug: boolean;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlags {
    [key: string]: boolean;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig extends BaseConfig {
    apiUrl: string;
    wsUrl?: string;
    features: FeatureFlags;
    logging: {
        level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
        enableConsole: boolean;
        enableFile: boolean;
    };
}
