/**
 * Hook for checking if mining flags are enabled
 *
 * Returns whether mining-related CLI flags (--guess, --compose) are enabled
 * based on the current Neptune Core settings.
 */

import { useCallback, useEffect, useState } from "react";
import type { MiningSettings } from "@/shared/types/neptune-core-settings";
import { useUIStore } from "@/store/ui.store";

interface UseMiningFlagsReturn {
    hasMiningFlags: boolean;
    isComposeEnabled: boolean;
    isGuessEnabled: boolean;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useMiningFlags(): UseMiningFlagsReturn {
    const [miningSettings, setMiningSettings] = useState<MiningSettings | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const experimentalMode = useUIStore((state) => state.experimentalMode);

    const fetchMiningSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result =
                await window.electronAPI.neptuneCoreSettings.getAll();

            if (result.success && result.settings) {
                setMiningSettings(result.settings.mining);
            } else {
                throw new Error(
                    result.error || "Failed to fetch mining settings",
                );
            }
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            console.error("Failed to load mining settings:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMiningSettings();
    }, [fetchMiningSettings]);

    // Check if any mining flags are enabled
    // For now, also allow experimental mode as a fallback for testing
    const hasMiningFlags = miningSettings
        ? miningSettings.compose || miningSettings.guess
        : experimentalMode; // Fallback to experimental mode for testing

    const isComposeEnabled = miningSettings?.compose || false;
    const isGuessEnabled = miningSettings?.guess || false;

    return {
        hasMiningFlags,
        isComposeEnabled,
        isGuessEnabled,
        isLoading,
        error,
        refetch: fetchMiningSettings,
    };
}
