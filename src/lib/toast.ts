/**
 * Toast Utility
 *
 * App-wide toast notification helper using Sonner
 * Provides consistent toast notifications across the application
 *
 * @see https://ui.shadcn.com/docs/components/sonner
 * @see https://sonner.emilkowal.ski/
 */

import { toast as sonnerToast } from "sonner";

/**
 * Show a success toast
 */
export const showSuccessToast = (
    message: string,
    options?: {
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
        duration?: number;
    },
) => {
    return sonnerToast.success(message, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
};

/**
 * Show an error toast
 */
export const showErrorToast = (
    message: string,
    options?: {
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
        duration?: number;
    },
) => {
    return sonnerToast.error(message, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
};

/**
 * Show a warning toast
 */
export const showWarningToast = (
    message: string,
    options?: {
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
        duration?: number;
    },
) => {
    return sonnerToast.warning(message, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
};

/**
 * Show an info toast
 */
export const showInfoToast = (
    message: string,
    options?: {
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
        duration?: number;
    },
) => {
    return sonnerToast.info(message, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
};

/**
 * Show a default toast
 */
export const showToast = (
    message: string,
    options?: {
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
        duration?: number;
    },
) => {
    return sonnerToast(message, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
};

/**
 * Show a loading toast
 * Returns a toast ID that can be used to update or dismiss the toast
 */
export const showLoadingToast = (
    message: string,
    options?: {
        description?: string;
        duration?: number;
    },
) => {
    return sonnerToast.loading(message, {
        description: options?.description,
        duration: options?.duration,
    });
};

/**
 * Show a promise toast
 * Automatically shows loading, success, or error states
 */
export const showPromiseToast = <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
        description?: string;
    },
) => {
    return sonnerToast.promise(promise, {
        loading: options.loading,
        success: options.success,
        error: options.error,
        description: options.description,
    });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
    sonnerToast.dismiss();
};

/**
 * Export the raw sonner toast function for advanced usage
 */
export { sonnerToast as toast };
