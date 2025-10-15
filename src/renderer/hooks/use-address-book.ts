/**
 * Address Book Hooks
 *
 * React hooks for managing address book entries
 */

import { useCallback, useState } from 'react';
import type { AddressBookEntry } from '@/shared/types/api-types';
import { rendererLoggers } from '../utils/logger';

const logger = rendererLoggers.hooks;

// Cache to prevent unnecessary refetches
let cachedEntries: AddressBookEntry[] | null = null;
let isCacheValid = false;

/**
 * Hook for managing address book entries
 */
export function useAddressBook() {
  const [entries, setEntries] = useState<AddressBookEntry[]>(
    cachedEntries || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async (force = false) => {
    // If cache is valid and not forcing, use cached data
    if (isCacheValid && !force && cachedEntries) {
      setEntries(cachedEntries);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.addressBook.getAll();

      if (result.success && result.entries) {
        cachedEntries = result.entries;
        isCacheValid = true;
        setEntries(result.entries);
      } else {
        setError(result.error || 'Failed to fetch address book entries');
      }
    } catch (err) {
      setError((err as Error).message);
      logger.error('Failed to fetch address book entries', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEntry = useCallback(
    async (data: {
      title: string;
      description: string;
      address: string;
    }): Promise<AddressBookEntry | null> => {
      setError(null);

      try {
        const result = await window.electronAPI.addressBook.create(data);

        if (result.success && result.entry) {
          // Invalidate cache and refresh
          isCacheValid = false;
          await fetchEntries(true);
          return result.entry;
        } else {
          setError(result.error || 'Failed to create entry');
          return null;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        setError(errorMsg);
        logger.error('Failed to create entry', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      }
    },
    [fetchEntries]
  );

  const updateEntry = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        description?: string;
        address?: string;
      }
    ): Promise<AddressBookEntry | null> => {
      setError(null);

      try {
        const result = await window.electronAPI.addressBook.update(id, data);

        if (result.success && result.entry) {
          // Invalidate cache and refresh
          isCacheValid = false;
          await fetchEntries(true);
          return result.entry;
        } else {
          setError(result.error || 'Failed to update entry');
          return null;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        setError(errorMsg);
        logger.error('Failed to update entry', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      }
    },
    [fetchEntries]
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      try {
        const result = await window.electronAPI.addressBook.delete(id);

        if (result.success) {
          // Invalidate cache and refresh
          isCacheValid = false;
          await fetchEntries(true);
          return true;
        } else {
          setError(result.error || 'Failed to delete entry');
          return false;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        setError(errorMsg);
        logger.error('Failed to delete entry', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        return false;
      }
    },
    [fetchEntries]
  );

  const searchEntries = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.addressBook.search(query);

      if (result.success && result.entries) {
        setEntries(result.entries);
      } else {
        setError(result.error || 'Failed to search entries');
      }
    } catch (err) {
      setError((err as Error).message);
      logger.error('Failed to search entries', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
  };
}

/**
 * Hook for exporting/importing address book
 */
export function useAddressBookIO() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportEntries = useCallback(async (): Promise<string | null> => {
    setIsExporting(true);
    setError(null);

    try {
      const result = await window.electronAPI.addressBook.export();

      if (result.success && result.json) {
        return result.json;
      } else {
        setError(result.error || 'Failed to export entries');
        return null;
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      logger.error('Failed to export entries', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importEntries = useCallback(
    async (json: string, merge = false): Promise<number | null> => {
      setIsImporting(true);
      setError(null);

      try {
        const result = await window.electronAPI.addressBook.import(json, merge);

        if (result.success && result.count !== undefined) {
          return result.count;
        } else {
          setError(result.error || 'Failed to import entries');
          return null;
        }
      } catch (err) {
        const errorMsg = (err as Error).message;
        setError(errorMsg);
        logger.error('Failed to import entries', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    []
  );

  return {
    isExporting,
    isImporting,
    error,
    exportEntries,
    importEntries,
  };
}
