import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SaveChangesBar } from "@/components/settings";
import type { NeptuneCoreSettings } from "@/shared/types/neptune-core-settings";
import {
    useLoadSettings,
    useNeptuneCoreSettingsStore,
    useSaveSettings,
} from "@/store/neptune-core-settings.store";

function SettingsLayout() {
    const settings = useNeptuneCoreSettingsStore((state) => state.settings);
    const loadSettings = useLoadSettings();
    const saveSettings = useSaveSettings();

    // State for tracking original settings and changes
    const [originalSettings, setOriginalSettings] =
        useState<NeptuneCoreSettings | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [changeCount, setChangeCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [needsRestart, setNeedsRestart] = useState(false);

    // Load original settings on mount and set them as the baseline
    useEffect(() => {
        const initializeSettings = async () => {
            await loadSettings();
            // After loading, get the fresh settings from the store and set as original
            const freshSettings =
                useNeptuneCoreSettingsStore.getState().settings;
            setOriginalSettings(freshSettings);
        };
        initializeSettings();
    }, [loadSettings]);

    // Deep comparison function to detect changes
    const deepEqual = useCallback((obj1: unknown, obj2: unknown): boolean => {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;

        if (
            typeof obj1 === "object" &&
            obj1 !== null &&
            typeof obj2 === "object" &&
            obj2 !== null
        ) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            if (keys1.length !== keys2.length) return false;

            for (const key of keys1) {
                if (!keys2.includes(key)) return false;
                if (
                    !deepEqual(
                        (obj1 as Record<string, unknown>)[key],
                        (obj2 as Record<string, unknown>)[key],
                    )
                )
                    return false;
            }
            return true;
        }

        return obj1 === obj2;
    }, []);

    // Count changes between current and original settings
    const countChanges = useCallback(
        (
            current: NeptuneCoreSettings,
            original: NeptuneCoreSettings,
        ): number => {
            let count = 0;

            // Compare each category
            const categories = [
                "network",
                "mining",
                "performance",
                "security",
                "data",
                "advanced",
            ] as const;

            for (const category of categories) {
                const currentCategory = current[category];
                const originalCategory = original[category];

                if (currentCategory && originalCategory) {
                    // Get all unique keys from both objects
                    const allKeys = new Set([
                        ...Object.keys(currentCategory),
                        ...Object.keys(originalCategory),
                    ]);

                    for (const key of allKeys) {
                        const currentValue =
                            currentCategory[
                                key as keyof typeof currentCategory
                            ];
                        const originalValue =
                            originalCategory[
                                key as keyof typeof originalCategory
                            ];

                        if (!deepEqual(currentValue, originalValue)) {
                            count++;
                        }
                    }
                } else if (currentCategory !== originalCategory) {
                    // One is null/undefined and the other isn't
                    count++;
                }
            }

            return count;
        },
        [deepEqual],
    );

    // Check for changes whenever settings change
    useEffect(() => {
        if (originalSettings && settings) {
            const changes = countChanges(settings, originalSettings);
            setChangeCount(changes);
            setHasChanges(changes > 0);
        }
    }, [settings, originalSettings, countChanges]);

    // Handle global save
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveSettings();
            // Get the fresh settings from the store after saving
            const freshSettings =
                useNeptuneCoreSettingsStore.getState().settings;
            // Update original settings to the fresh saved settings
            setOriginalSettings(freshSettings);
            setHasChanges(false);
            setChangeCount(0);
            setNeedsRestart(true);

            console.log("✅ Settings saved successfully");
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle reset
    const handleReset = async () => {
        if (!originalSettings) return;

        console.log("🔄 Reloading settings from storage...");

        // Reload settings from IPC/storage to get the true saved state
        await loadSettings();

        // Get the freshly loaded settings from the store
        const freshSettings = useNeptuneCoreSettingsStore.getState().settings;

        // Update our baseline to the freshly loaded settings
        setOriginalSettings(freshSettings);
        setHasChanges(false);
        setChangeCount(0);

        console.log("✅ Settings reset to last saved state");
    };

    console.log("💾 SaveChangesBar state:", {
        hasChanges,
        changeCount,
        isSaving,
        needsRestart,
    });

    return (
        <>
            <Outlet />

            {/* Global SaveChangesBar - Shows when ANY category has changes */}
            <SaveChangesBar
                isVisible={true}
                hasChanges={hasChanges}
                changeCount={changeCount}
                onSave={handleSave}
                onReset={handleReset}
                isSaving={isSaving}
            />
        </>
    );
}

export const Route = createFileRoute("/settings")({
    component: SettingsLayout,
});
