/**
 * useSettingsForm Hook
 *
 * Reusable hook for managing settings forms with change detection,
 * validation, and IPC integration.
 */

import { useEffect, useState, useCallback } from "react";
import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import type {
    NetworkSettings,
    MiningSettings,
    PerformanceSettings,
    SecuritySettings,
    DataSettings,
    AdvancedSettings,
} from "@/shared/types/neptune-core-settings";

type SettingsCategory =
    | "network"
    | "mining"
    | "performance"
    | "security"
    | "data"
    | "advanced";

type CategorySettingsMap = {
    network: NetworkSettings;
    mining: MiningSettings;
    performance: PerformanceSettings;
    security: SecuritySettings;
    data: DataSettings;
    advanced: AdvancedSettings;
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
        mode: "onChange",
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
                const result =
                    await window.electronAPI.neptuneCoreSettings.getAll();

                if (result.success && result.settings) {
                    const categoryData = result.settings[category] as T;
                    setInitialData(categoryData);
                    reset(categoryData); // Initialize form with loaded data
                } else {
                    console.error("Failed to load settings:", result.error);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [category, reset]);

    // Get the correct update method based on category
    const getUpdateMethod = useCallback((cat: SettingsCategory) => {
        const methodMap = {
            network: "updateNetwork",
            mining: "updateMining",
            performance: "updatePerformance",
            security: "updateSecurity",
            data: "updateData",
            advanced: "updateAdvanced",
        } as const;

        return methodMap[cat];
    }, []);

    // Save handler
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await handleSubmit(async (data) => {
                console.log(`💾 Saving ${category} settings:`, data);
                const updateMethod = getUpdateMethod(category);
                const result = await window.electronAPI.neptuneCoreSettings[
                    updateMethod
                ](data as never);

                console.log(`✅ Save result for ${category}:`, result);

                if (result.success && result.settings) {
                    // Update baseline with saved data
                    const updatedCategoryData = result.settings[category] as T;
                    console.log(
                        `📝 Updated ${category} data:`,
                        updatedCategoryData,
                    );
                    setInitialData(updatedCategoryData);

                    console.log(
                        `🔄 Resetting ${category} form to clear isDirty...`,
                    );
                    reset(updatedCategoryData); // Reset form state, clears isDirty
                } else {
                    throw new Error(result.error || "Failed to save settings");
                }
            })();
        } catch (error) {
            console.error(`❌ Error saving ${category} settings:`, error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [category, getUpdateMethod, handleSubmit, reset]);

    // Reset handler
    const handleReset = useCallback(() => {
        if (initialData) {
            reset(initialData); // Revert to initial loaded data
        }
    }, [initialData, reset]);

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
