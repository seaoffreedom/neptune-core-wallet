/**
 * Base Settings Form Component
 *
 * Provides a reusable base for all settings forms to eliminate DRY violations.
 * Handles common patterns like field changes, form structure, and Zustand integration.
 */

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import type { FieldValues } from "react-hook-form";

interface BaseSettingsFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  updateSettings: (settings: Partial<T>) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Base Settings Form Component
 * 
 * Provides common functionality for all settings forms:
 * - handleFieldChange helper for immediate Zustand updates
 * - Consistent form structure
 * - Type-safe field updates
 */
export function BaseSettingsForm<T extends FieldValues>({
  form,
  updateSettings,
  children,
  className = "space-y-6",
}: BaseSettingsFormProps<T>) {
  // Helper to update both form and Zustand store immediately
  const handleFieldChange = (field: keyof T, value: unknown) => {
    // Update Zustand store immediately for real-time updates
    updateSettings({
      [field]: value,
    } as Partial<T>);
  };

  return (
    <Form {...form}>
      <form className={className}>
        {/* Render children with handleFieldChange available via context or props */}
        {typeof children === "function" 
          ? children(handleFieldChange)
          : children
        }
      </form>
    </Form>
  );
}

/**
 * Hook to use the base settings form functionality
 * 
 * @param updateSettings - Function to update settings in Zustand store
 * @returns handleFieldChange function for immediate store updates
 */
export function useBaseSettingsForm<T extends FieldValues>(
  updateSettings: (settings: Partial<T>) => void,
) {
  const handleFieldChange = (field: keyof T, value: unknown) => {
    updateSettings({
      [field]: value,
    } as Partial<T>);
  };

  return { handleFieldChange };
}

/**
 * Higher-order component for settings forms
 * 
 * Wraps a settings form component with common functionality
 */
export function withBaseSettingsForm<T extends FieldValues>(
  Component: React.ComponentType<{
    form: UseFormReturn<T>;
    handleFieldChange: (field: keyof T, value: unknown) => void;
  }>,
) {
  return function WrappedSettingsForm({
    form,
    updateSettings,
    ...props
  }: {
    form: UseFormReturn<T>;
    updateSettings: (settings: Partial<T>) => void;
  } & Omit<React.ComponentProps<typeof Component>, "handleFieldChange">) {
    const { handleFieldChange } = useBaseSettingsForm(updateSettings);
    
    return (
      <Component
        form={form}
        handleFieldChange={handleFieldChange}
        {...props}
      />
    );
  };
}
