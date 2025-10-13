import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsForm } from "@/renderer/hooks/use-settings-form";
import { usePriceFetchingSettings } from "@/store/neptune-core-settings.store";
import { PriceSettingsForm } from "@/components/settings/price-settings-form";
import { priceSettingsSchema } from "@/lib/validation/settings-schemas";

// Form data interface
interface PriceSettingsFormData {
    enabled: boolean;
    currency: "USD" | "EUR" | "GBP";
    cacheTtl: number;
}

export const Route = createFileRoute("/settings/price")({
    component: PriceSettings,
});

function PriceSettings() {
    const { form, isLoading } = useSettingsForm<PriceSettingsFormData>({
        category: "priceFetching",
        schema: priceSettingsSchema,
    });

    // Watch for Zustand store changes and reset form accordingly
    const priceFetchingSettings = usePriceFetchingSettings();
    useEffect(() => {
        if (priceFetchingSettings && !isLoading) {
            form.reset(priceFetchingSettings);
        }
    }, [priceFetchingSettings, form, isLoading]);

    return (
        <PageContainer>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                        Price & Currency Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Configure price fetching from CoinGecko, currency
                        display preferences, and market data caching.
                    </p>
                </div>

                {/* Price Settings Form */}
                {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <PriceSettingsForm form={form} />
                )}
            </div>
        </PageContainer>
    );
}
