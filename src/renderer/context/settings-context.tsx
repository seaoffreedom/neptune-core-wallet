/**
 * Global Settings Context
 *
 * Manages settings state across all categories, enabling users to
 * make changes in multiple categories before saving all at once.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { rendererLoggers } from '../utils/logger';

const logger = rendererLoggers.app;

type SettingsCategory =
  | 'network'
  | 'mining'
  | 'performance'
  | 'security'
  | 'data'
  | 'advanced'
  | 'priceFetching';

interface CategoryState {
  isDirty: boolean;
  dirtyCount: number;
  form: UseFormReturn<Record<string, unknown>> | null;
  handleSave: (() => Promise<void>) | null;
  handleReset: (() => void) | null;
}

interface SettingsContextValue {
  // Category-specific state
  categories: Record<SettingsCategory, CategoryState>;

  // Global aggregated state
  hasAnyChanges: boolean;
  totalChangeCount: number;
  dirtyCategories: SettingsCategory[];

  // Restart tracking
  needsRestart: boolean;
  acknowledgeRestart: () => void;

  // Registration methods (called by individual routes)
  registerCategory: (category: SettingsCategory, state: CategoryState) => void;
  unregisterCategory: (category: SettingsCategory) => void;

  // Global actions
  saveAllChanges: () => Promise<void>;
  resetAllChanges: () => void;

  // Saving state
  isSaving: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<
    Record<SettingsCategory, CategoryState>
  >({
    network: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    mining: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    performance: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    security: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    data: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    advanced: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
    priceFetching: {
      isDirty: false,
      dirtyCount: 0,
      form: null,
      handleSave: null,
      handleReset: null,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);

  // Register a category's state
  const registerCategory = useCallback(
    (category: SettingsCategory, state: CategoryState) => {
      logger.debug(`Registering ${category}`, {
        isDirty: state.isDirty,
        dirtyCount: state.dirtyCount,
      });
      setCategories((prev) => {
        const updated = {
          ...prev,
          [category]: state,
        };
        logger.debug(`Updated categories state`, {
          category,
          newState: state,
          allDirty: Object.entries(updated)
            .filter(([_, s]) => s.isDirty)
            .map(([cat]) => cat),
        });
        return updated;
      });
    },
    []
  );

  // Unregister a category (cleanup on unmount)
  // Note: We keep isDirty and dirtyCount, only clear function references
  const unregisterCategory = useCallback((category: SettingsCategory) => {
    setCategories((prev) => ({
      ...prev,
      [category]: {
        ...prev[category], // Keep existing isDirty and dirtyCount
        form: null,
        handleSave: null,
        handleReset: null,
      },
    }));
  }, []);

  // Compute global state
  const dirtyCategories = Object.entries(categories)
    .filter(([_, state]) => state.isDirty)
    .map(([cat]) => cat as SettingsCategory);

  const hasAnyChanges = dirtyCategories.length > 0;

  const totalChangeCount = Object.values(categories).reduce(
    (sum, state) => sum + state.dirtyCount,
    0
  );

  logger.debug('Global state computed', {
    dirtyCategories,
    hasAnyChanges,
    totalChangeCount,
    needsRestart,
  });

  // Save all dirty categories
  const saveAllChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      // Get fresh list of dirty categories at save time
      const categoriesToSave = Object.entries(categories)
        .filter(([_, state]) => state.isDirty && state.handleSave)
        .map(([cat]) => cat as SettingsCategory);

      logger.info('Saving all dirty categories', {
        categories: categoriesToSave,
      });

      // Save all dirty categories in parallel
      const savePromises = categoriesToSave.map((category) => {
        const state = categories[category];
        if (state.handleSave) {
          return state.handleSave();
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);

      logger.info('All categories saved successfully');

      // Manually clear isDirty for all saved categories to ensure immediate state update
      // This prevents the SaveChangesBar from lingering due to async form state updates
      setCategories((prev) => {
        const updated = { ...prev };
        categoriesToSave.forEach((category) => {
          updated[category] = {
            ...updated[category],
            isDirty: false,
            dirtyCount: 0,
          };
        });
        logger.debug('Manually cleared isDirty for', {
          categories: categoriesToSave,
        });
        return updated;
      });

      // Mark that a restart is needed to apply saved settings
      setNeedsRestart(true);
    } catch (error) {
      logger.error('Error saving categories', {
        error: (error as Error).message,
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [categories]);

  // Reset all dirty categories
  const resetAllChanges = useCallback(() => {
    logger.info('Resetting all dirty categories', {
      categories: dirtyCategories,
    });

    dirtyCategories.forEach((category) => {
      const state = categories[category];
      if (state.handleReset) {
        state.handleReset();
      }
    });

    logger.info('All categories reset');
  }, [categories, dirtyCategories]);

  // Acknowledge restart (user has restarted the app)
  const acknowledgeRestart = useCallback(() => {
    setNeedsRestart(false);
  }, []);

  const value: SettingsContextValue = {
    categories,
    hasAnyChanges,
    totalChangeCount,
    dirtyCategories,
    needsRestart,
    acknowledgeRestart,
    registerCategory,
    unregisterCategory,
    saveAllChanges,
    resetAllChanges,
    isSaving,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
}
