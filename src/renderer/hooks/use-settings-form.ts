/**
 * useSettingsForm Hook
 *
 * Reusable hook for managing settings forms with change detection,
 * validation, and IPC integration.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { type FieldValues, type UseFormReturn, useForm } from 'react-hook-form';
import type { ZodType } from 'zod';
import { rendererLoggers } from '../utils/logger';

const logger = rendererLoggers.hooks;

import type {
  AdvancedSettings,
  DataSettings,
  MiningSettings,
  NetworkSettings,
  PerformanceSettings,
  PriceFetchingSettings,
  SecuritySettings,
} from '@/shared/types/neptune-core-settings';

type SettingsCategory =
  | 'network'
  | 'mining'
  | 'performance'
  | 'security'
  | 'data'
  | 'advanced'
  | 'priceFetching';

type CategorySettingsMap = {
  network: NetworkSettings;
  mining: MiningSettings;
  performance: PerformanceSettings;
  security: SecuritySettings;
  data: DataSettings;
  advanced: AdvancedSettings;
  priceFetching: PriceFetchingSettings;
};

interface UseSettingsFormOptions<T extends FieldValues> {
  category: SettingsCategory;
  schema: ZodType<T>;
}

interface UseSettingsFormReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  dirtyCount: number;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}

export function useSettingsForm<
  T extends CategorySettingsMap[SettingsCategory] & FieldValues,
>(options: UseSettingsFormOptions<T>): UseSettingsFormReturn<T> {
  const { category, schema } = options;

  const [initialData, setInitialData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<T>({
    // @ts-expect-error - ZodType generic constraints conflict with RHF FieldValues
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const {
    formState: { isDirty, dirtyFields },
    reset,
    handleSubmit,
  } = form;

  // Count dirty fields
  const dirtyCount = Object.keys(dirtyFields).length;

  // Load initial settings from IPC
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const result = await window.electronAPI.neptuneCoreSettings.getAll();

        if (result.success && result.settings) {
          const categoryData = result.settings[category] as T;

          // Transform data for form initialization if needed
          let formData = categoryData;
          if (category === 'priceFetching') {
            formData = {
              ...categoryData,
              cacheTtl: String((categoryData as { cacheTtl: number }).cacheTtl),
            } as T;
          }

          // Set the transformed data as initial data to match form state
          setInitialData(formData);
          reset(formData); // Initialize form with loaded data
        } else {
          logger.error('Failed to load settings', {
            error: result.error,
          });
        }
      } catch (error) {
        logger.error('Error loading settings', {
          error: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [category, reset]);

  // Get the correct update method based on category
  const getUpdateMethod = useCallback((cat: SettingsCategory) => {
    const methodMap = {
      network: 'updateNetwork',
      mining: 'updateMining',
      performance: 'updatePerformance',
      security: 'updateSecurity',
      data: 'updateData',
      advanced: 'updateAdvanced',
      priceFetching: 'updatePriceFetching',
    } as const;

    return methodMap[cat];
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await handleSubmit(async (data) => {
        logger.info(`Saving ${category} settings`, data);

        // Transform form data for specific categories
        let transformedData = data;
        if (category === 'priceFetching') {
          transformedData = {
            ...data,
            cacheTtl: parseInt((data as { cacheTtl: string }).cacheTtl, 10),
          };
        }

        const updateMethod = getUpdateMethod(category);
        const result = await window.electronAPI.neptuneCoreSettings[
          updateMethod
        ](transformedData as never);

        logger.info(`Save result for ${category}`, result);

        if (result.success && result.settings) {
          // Update baseline with saved data
          const updatedCategoryData = result.settings[category] as T;
          logger.info(`Updated ${category} data`, updatedCategoryData);

          logger.info(`Resetting ${category} form to clear isDirty...`);

          // Transform data for form reset if needed
          let formData = updatedCategoryData;
          if (category === 'priceFetching') {
            formData = {
              ...updatedCategoryData,
              cacheTtl: String(
                (updatedCategoryData as { cacheTtl: number }).cacheTtl
              ),
            } as T;
          }

          // Set the transformed data as initial data to match form state
          setInitialData(formData);
          reset(formData); // Reset form state, clears isDirty
        } else {
          throw new Error(result.error || 'Failed to save settings');
        }
      })();
    } catch (error) {
      logger.error(`Error saving ${category} settings`, {
        error: (error as Error).message,
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [category, getUpdateMethod, handleSubmit, reset]);

  // Reset handler
  const handleReset = useCallback(() => {
    if (initialData) {
      // Transform data for form reset if needed
      let formData = initialData;
      if (category === 'priceFetching') {
        formData = {
          ...initialData,
          cacheTtl: String((initialData as { cacheTtl: number }).cacheTtl),
        } as T;
      }
      reset(formData); // Revert to initial loaded data
    }
  }, [initialData, reset, category]);

  return {
    form: form as unknown as UseFormReturn<T>,
    isLoading,
    isSaving,
    isDirty,
    dirtyCount,
    handleSave,
    handleReset,
  };
}
