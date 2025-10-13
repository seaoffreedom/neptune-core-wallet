import { create } from "zustand";
import type {
    AdvancedSettings,
    DataSettings,
    MiningSettings,
    NeptuneCoreSettings,
    NetworkSettings,
    PerformanceSettings,
    PriceFetchingSettings,
    SecuritySettings,
} from "@/shared/types/neptune-core-settings";

interface NeptuneCoreSettingsState {
    // Settings state
    settings: NeptuneCoreSettings | null;
    isLoading: boolean;
    error: string | null;

    // Actions for individual categories
    updateNetworkSettings: (settings: Partial<NetworkSettings>) => void;
    updateMiningSettings: (settings: Partial<MiningSettings>) => void;
    updatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
    updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
    updateDataSettings: (settings: Partial<DataSettings>) => void;
    updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;
    updatePriceFetchingSettings: (
        settings: Partial<PriceFetchingSettings>,
    ) => void;

    // Global actions
    loadSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
    resetToDefaults: () => Promise<void>;
    clearError: () => void;

    // Set settings directly (for initial load)
    setSettings: (settings: NeptuneCoreSettings) => void;
}

export const useNeptuneCoreSettingsStore = create<NeptuneCoreSettingsState>()(
    (set, get) => ({
        // Initial state
        settings: null,
        isLoading: false,
        error: null,

        // Update actions for each category
        updateNetworkSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    network: { ...settings.network, ...newSettings },
                },
            });

            console.log("📡 Network settings updated:", newSettings);
        },

        updateMiningSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    mining: { ...settings.mining, ...newSettings },
                },
            });

            console.log("⛏️  Mining settings updated:", newSettings);
        },

        updatePerformanceSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    performance: { ...settings.performance, ...newSettings },
                },
            });

            console.log("⚡ Performance settings updated:", newSettings);
        },

        updateSecuritySettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    security: { ...settings.security, ...newSettings },
                },
            });

            console.log("🔒 Security settings updated:", newSettings);
        },

        updateDataSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    data: { ...settings.data, ...newSettings },
                },
            });

            console.log("💾 Data settings updated:", newSettings);
        },

        updateAdvancedSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    advanced: { ...settings.advanced, ...newSettings },
                },
            });

            console.log("🔧 Advanced settings updated:", newSettings);
        },

        updatePriceFetchingSettings: (newSettings) => {
            const { settings } = get();
            if (!settings) return;

            set({
                settings: {
                    ...settings,
                    priceFetching: {
                        ...settings.priceFetching,
                        ...newSettings,
                    },
                },
            });

            console.log("💰 Price fetching settings updated:", newSettings);
        },

        // Load settings from IPC
        loadSettings: async () => {
            set({ isLoading: true, error: null });
            try {
                const result =
                    await window.electronAPI.neptuneCoreSettings.getAll();

                if (result.success && result.settings) {
                    set({
                        settings: result.settings,
                        isLoading: false,
                    });
                    console.log("✅ Settings loaded:", result.settings);
                } else {
                    throw new Error(result.error || "Failed to load settings");
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to load settings";
                set({ error: errorMessage, isLoading: false });
                console.error("❌ Error loading settings:", error);
            }
        },

        // Save all settings to IPC
        saveSettings: async () => {
            const { settings } = get();
            if (!settings) {
                console.error("❌ No settings to save");
                return;
            }

            set({ isLoading: true, error: null });
            try {
                const result =
                    await window.electronAPI.neptuneCoreSettings.updateAll(
                        settings,
                    );

                if (result.success) {
                    set({ isLoading: false });
                    console.log("✅ Settings saved successfully");
                } else {
                    throw new Error(result.error || "Failed to save settings");
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to save settings";
                set({ error: errorMessage, isLoading: false });
                console.error("❌ Error saving settings:", error);
            }
        },

        // Reset to defaults
        resetToDefaults: async () => {
            set({ isLoading: true, error: null });
            try {
                const result =
                    await window.electronAPI.neptuneCoreSettings.resetToDefaults();

                if (result.success && result.settings) {
                    set({
                        settings: result.settings,
                        isLoading: false,
                    });
                    console.log("✅ Settings reset to defaults");
                } else {
                    throw new Error(result.error || "Failed to reset settings");
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to reset settings";
                set({ error: errorMessage, isLoading: false });
                console.error("❌ Error resetting settings:", error);
            }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Set settings directly
        setSettings: (settings) => set({ settings }),
    }),
);

// Selector hooks for each category
export const useNetworkSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.network);

export const useMiningSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.mining);

export const usePerformanceSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.performance);

export const useSecuritySettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.security);

export const useDataSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.data);

export const useAdvancedSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.advanced);

export const usePriceFetchingSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.settings?.priceFetching);

// Selector hooks for update actions
export const useUpdateNetworkSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updateNetworkSettings);

export const useUpdateMiningSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updateMiningSettings);

export const useUpdatePerformanceSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updatePerformanceSettings);

export const useUpdateSecuritySettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updateSecuritySettings);

export const useUpdateDataSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updateDataSettings);

export const useUpdateAdvancedSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updateAdvancedSettings);

export const useUpdatePriceFetchingSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.updatePriceFetchingSettings);

// Global action hooks
export const useLoadSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.loadSettings);

export const useSaveSettings = () =>
    useNeptuneCoreSettingsStore((state) => state.saveSettings);

export const useResetToDefaults = () =>
    useNeptuneCoreSettingsStore((state) => state.resetToDefaults);
