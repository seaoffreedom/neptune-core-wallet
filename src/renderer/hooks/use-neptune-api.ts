/**
 * Neptune API Hook
 *
 * React hook for using Neptune process management functionality in the renderer process.
 * Provides a clean interface for managing neptune-core and neptune-cli processes.
 */

import { useCallback, useState } from 'react';

export interface NeptuneTaskState {
  isLoading: boolean;
  error: string | null;
  result: unknown | null;
}

export interface UseNeptuneAPI {
  // Process management
  initialize: () => Promise<boolean>;
  shutdown: () => Promise<boolean>;
  restart: () => Promise<boolean>;
  getStatus: () => Promise<unknown>;

  // Data access
  getCookie: () => Promise<string | null>;
  getWalletData: () => Promise<unknown>;

  // State
  taskState: NeptuneTaskState;
  clearError: () => void;
}

export function useNeptuneAPI(): UseNeptuneAPI {
  const [taskState, setTaskState] = useState<NeptuneTaskState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const executeTask = useCallback(
    async <T>(
      task: () => Promise<T>,
      successMessage?: string
    ): Promise<T | null> => {
      setTaskState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await task();

        setTaskState((prev) => ({
          ...prev,
          isLoading: false,
          result: result,
        }));

        if (successMessage) {
          console.log(successMessage);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        setTaskState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    []
  );

  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      const result = await executeTask(
        () => window.electronAPI.initializeNeptune(),
        'Neptune processes initialized successfully'
      );

      return result?.success || false;
    } catch (error) {
      console.error('Failed to initialize Neptune:', error);
      return false;
    }
  }, [executeTask]);

  const shutdown = useCallback(async (): Promise<boolean> => {
    try {
      const result = await executeTask(
        () => window.electronAPI.shutdownNeptune(),
        'Neptune processes shutdown successfully'
      );

      return result?.success || false;
    } catch (error) {
      console.error('Failed to shutdown Neptune:', error);
      return false;
    }
  }, [executeTask]);

  const restart = useCallback(async (): Promise<boolean> => {
    try {
      const result = await executeTask(
        () => window.electronAPI.restartNeptune(),
        'Neptune processes restarted successfully'
      );

      return result?.success || false;
    } catch (error) {
      console.error('Failed to restart Neptune:', error);
      return false;
    }
  }, [executeTask]);

  const getStatus = useCallback(async (): Promise<unknown> => {
    try {
      const result = await window.electronAPI.getNeptuneStatus();
      return result;
    } catch (error) {
      console.error('Failed to get Neptune status:', error);
      throw error;
    }
  }, []);

  const getCookie = useCallback(async (): Promise<string | null> => {
    try {
      const result = await window.electronAPI.getNeptuneCookie();
      return result.success ? result.cookie || null : null;
    } catch (error) {
      console.error('Failed to get Neptune cookie:', error);
      return null;
    }
  }, []);

  const getWalletData = useCallback(async (): Promise<unknown> => {
    try {
      const result = await window.electronAPI.getNeptuneWalletData();
      return result;
    } catch (error) {
      console.error('Failed to get Neptune wallet data:', error);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setTaskState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    initialize,
    shutdown,
    restart,
    getStatus,
    getCookie,
    getWalletData,
    taskState,
    clearError,
  };
}
