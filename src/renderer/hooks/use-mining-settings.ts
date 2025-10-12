/**
 * Hook for fetching and managing mining settings
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NeptuneCoreSettings } from '@/shared/types/neptune-core-settings';

interface UseMiningSettingsReturn {
  settings: NeptuneCoreSettings | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMiningSettings(): UseMiningSettingsReturn {
  const [settings, setSettings] = useState<NeptuneCoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.neptuneCoreSettings.getAll();

      if (result.success && result.settings) {
        setSettings(result.settings);
      } else {
        throw new Error(result.error || 'Failed to fetch mining settings');
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error('Failed to load mining settings', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
  };
}
