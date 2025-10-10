/**
 * Neptune Core Settings Service
 *
 * Manages persistent storage of neptune-core CLI configuration
 * Uses electron-store for cross-platform storage
 */

import Store from "electron-store";
import type {
    AdvancedSettings,
    DataSettings,
    MiningSettings,
    NeptuneCoreSettings,
    NetworkSettings,
    PerformanceSettings,
    SecuritySettings,
} from "@/shared/types/neptune-core-settings";
import {
    DEFAULT_ADVANCED_SETTINGS,
    DEFAULT_DATA_SETTINGS,
    DEFAULT_MINING_SETTINGS,
    DEFAULT_NEPTUNE_CORE_SETTINGS,
    DEFAULT_NETWORK_SETTINGS,
    DEFAULT_PERFORMANCE_SETTINGS,
    DEFAULT_SECURITY_SETTINGS,
} from "@/shared/types/neptune-core-settings";

// Store schema
interface SettingsStore {
    neptuneCore: NeptuneCoreSettings;
}

// Initialize electron-store with schema
const store = new Store<SettingsStore>({
    name: "neptune-core-settings",
    defaults: {
        neptuneCore: DEFAULT_NEPTUNE_CORE_SETTINGS,
    },
    // Enable encryption for sensitive data
    encryptionKey: "neptune-core-wallet-settings",
});

/**
 * Neptune Core Settings Service
 */
export class NeptuneCoreSettingsService {
    /**
     * Get all settings
     */
    getAll(): NeptuneCoreSettings {
        return store.get("neptuneCore");
    }

    /**
     * Update all settings
     */
    updateAll(settings: NeptuneCoreSettings): NeptuneCoreSettings {
        store.set("neptuneCore", settings);
        return this.getAll();
    }

    /**
     * Update network settings
     */
    updateNetwork(settings: Partial<NetworkSettings>): NeptuneCoreSettings {
        const current = this.getAll();
        const updated: NeptuneCoreSettings = {
            ...current,
            network: {
                ...current.network,
                ...settings,
            },
        };
        store.set("neptuneCore", updated);
        return this.getAll();
    }

    /**
     * Update mining settings
     */
    updateMining(settings: Partial<MiningSettings>): NeptuneCoreSettings {
        const current = this.getAll();
        const updated: NeptuneCoreSettings = {
            ...current,
            mining: {
                ...current.mining,
                ...settings,
            },
        };
        store.set("neptuneCore", updated);
        return this.getAll();
    }

    /**
     * Update performance settings
     */
    updatePerformance(
        settings: Partial<PerformanceSettings>,
    ): NeptuneCoreSettings {
        const current = this.getAll();
        const updated: NeptuneCoreSettings = {
            ...current,
            performance: {
                ...current.performance,
                ...settings,
            },
        };
        store.set("neptuneCore", updated);
        return this.getAll();
    }

    /**
     * Update security settings
     */
    updateSecurity(settings: Partial<SecuritySettings>): NeptuneCoreSettings {
        const current = this.getAll();
        const updated: NeptuneCoreSettings = {
            ...current,
            security: {
                ...current.security,
                ...settings,
            },
        };
        store.set("neptuneCore", updated);
        return this.getAll();
    }

    /**
     * Update data settings
     */
    updateData(settings: Partial<DataSettings>): NeptuneCoreSettings {
        const current = this.getAll();
        const updated: NeptuneCoreSettings = {
            ...current,
            data: {
                ...current.data,
                ...settings,
            },
        };
        store.set("neptuneCore", updated);
        return this.getAll();
    }

    /**
     * Update advanced settings
     */
    updateAdvanced(settings: Partial<AdvancedSettings>): NeptuneCoreSettings {
        const current = this.getAll();
        console.log("🔍 Current advanced settings:", current.advanced);
        console.log("🔄 Incoming update:", settings);
        const updated: NeptuneCoreSettings = {
            ...current,
            advanced: {
                ...current.advanced,
                ...settings,
            },
        };
        console.log("✨ Updated advanced settings:", updated.advanced);
        store.set("neptuneCore", updated);
        const result = this.getAll();
        console.log("💾 Saved advanced settings:", result.advanced);
        return result;
    }

    /**
     * Reset all settings to defaults
     */
    resetToDefaults(): NeptuneCoreSettings {
        store.set("neptuneCore", DEFAULT_NEPTUNE_CORE_SETTINGS);
        return this.getAll();
    }

    /**
     * Reset network settings to defaults
     */
    resetNetworkToDefaults(): NeptuneCoreSettings {
        return this.updateNetwork(DEFAULT_NETWORK_SETTINGS);
    }

    /**
     * Reset mining settings to defaults
     */
    resetMiningToDefaults(): NeptuneCoreSettings {
        return this.updateMining(DEFAULT_MINING_SETTINGS);
    }

    /**
     * Reset performance settings to defaults
     */
    resetPerformanceToDefaults(): NeptuneCoreSettings {
        return this.updatePerformance(DEFAULT_PERFORMANCE_SETTINGS);
    }

    /**
     * Reset security settings to defaults
     */
    resetSecurityToDefaults(): NeptuneCoreSettings {
        return this.updateSecurity(DEFAULT_SECURITY_SETTINGS);
    }

    /**
     * Reset data settings to defaults
     */
    resetDataToDefaults(): NeptuneCoreSettings {
        return this.updateData(DEFAULT_DATA_SETTINGS);
    }

    /**
     * Reset advanced settings to defaults
     */
    resetAdvancedToDefaults(): NeptuneCoreSettings {
        return this.updateAdvanced(DEFAULT_ADVANCED_SETTINGS);
    }

    /**
     * Export settings as JSON string
     */
    exportSettings(): string {
        const settings = this.getAll();
        return JSON.stringify(settings, null, 2);
    }

    /**
     * Import settings from JSON string
     */
    importSettings(jsonString: string): NeptuneCoreSettings {
        try {
            const settings = JSON.parse(jsonString) as NeptuneCoreSettings;

            // Validate structure (basic check)
            if (
                !settings.network ||
                !settings.mining ||
                !settings.performance ||
                !settings.security ||
                !settings.data ||
                !settings.advanced
            ) {
                throw new Error("Invalid settings structure");
            }

            // Merge with defaults to ensure all required fields exist
            const merged: NeptuneCoreSettings = {
                network: { ...DEFAULT_NETWORK_SETTINGS, ...settings.network },
                mining: { ...DEFAULT_MINING_SETTINGS, ...settings.mining },
                performance: {
                    ...DEFAULT_PERFORMANCE_SETTINGS,
                    ...settings.performance,
                },
                security: {
                    ...DEFAULT_SECURITY_SETTINGS,
                    ...settings.security,
                },
                data: { ...DEFAULT_DATA_SETTINGS, ...settings.data },
                advanced: {
                    ...DEFAULT_ADVANCED_SETTINGS,
                    ...settings.advanced,
                },
            };

            store.set("neptuneCore", merged);
            return this.getAll();
        } catch (error) {
            throw new Error(
                `Failed to import settings: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Get store file path (for debugging)
     */
    getStorePath(): string {
        return store.path;
    }

    /**
     * Clear all settings (use with caution)
     */
    clearAll(): void {
        store.clear();
        // Restore defaults after clearing
        store.set("neptuneCore", DEFAULT_NEPTUNE_CORE_SETTINGS);
    }
}

// Export singleton instance
// Lazy singleton instance
let _neptuneCoreSettingsServiceInstance: NeptuneCoreSettingsService | null =
    null;

/**
 * Get the singleton NeptuneCoreSettingsService instance (lazy initialization)
 */
export function getNeptuneCoreSettingsService(): NeptuneCoreSettingsService {
    if (!_neptuneCoreSettingsServiceInstance) {
        _neptuneCoreSettingsServiceInstance = new NeptuneCoreSettingsService();
        logger.info(
            "NeptuneCoreSettingsService instance created (lazy initialization)",
        );
    }
    return _neptuneCoreSettingsServiceInstance;
}

// Backward compatibility - keep the old export for existing code
export const neptuneCoreSettingsService = new Proxy(
    {} as NeptuneCoreSettingsService,
    {
        get(_target, prop) {
            const instance = getNeptuneCoreSettingsService();
            const value = (instance as Record<string, unknown>)[prop];
            return typeof value === "function" ? value.bind(instance) : value;
        },
    },
);
