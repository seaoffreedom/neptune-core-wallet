/**
 * Price Settings Form Component
 *
 * Form for configuring price fetching settings including enable/disable toggle,
 * currency selection, and cache TTL configuration.
 */

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BaseSettingsForm, SettingsFormFields } from "./base-settings-form";
import {
    usePriceFetchingSettings,
    useUpdatePriceFetchingSettings,
} from "@/store/neptune-core-settings.store";
import {
    useSelectedCurrencySafe,
    useSetCurrency,
    AVAILABLE_CURRENCIES,
} from "@/store/ui.store";
import {
    usePricePolling,
    useIsPriceCacheValid,
    useCacheExpiryTime,
} from "@/hooks/use-price-polling";
import type { PriceSettingsFormProps } from "@/shared/types/settings-forms";
import { DollarSign, RefreshCw } from "lucide-react";
import { rendererLoggers, logInfo } from "@/renderer/utils/logger";

export function PriceSettingsForm({ form }: PriceSettingsFormProps) {
    const priceFetchingSettings = usePriceFetchingSettings();
    const updatePriceFetchingSettings = useUpdatePriceFetchingSettings();
    const selectedCurrency = useSelectedCurrencySafe();
    const setCurrency = useSetCurrency();
    const { isPollingActive, fetchAndUpdatePrices } = usePricePolling();
    const isCacheValid = useIsPriceCacheValid();
    const cacheExpiryTime = useCacheExpiryTime();

    const logger = rendererLoggers.price;

    const handleRefreshPrices = async () => {
        logInfo(logger, "Manually refreshing prices");
        await fetchAndUpdatePrices();
    };

    return (
        <div className="space-y-6">
            <BaseSettingsForm
                form={form}
                updateSettings={updatePriceFetchingSettings}
            >
                <SettingsFormFields.Card
                    title="Price Fetching"
                    description="Configure automatic price fetching from CoinGecko API"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Price Fetching</span>
                    </div>

                    <SettingsFormFields.Switch
                        form={form}
                        name="enabled"
                        label="Enable Price Fetching"
                        description="Automatically fetch Neptune prices from CoinGecko API"
                        updateSettings={updatePriceFetchingSettings}
                    />

                    <SettingsFormFields.Select
                        form={form}
                        name="currency"
                        label="Display Currency"
                        description="Currency to display for price conversions"
                        placeholder="Select currency"
                        options={AVAILABLE_CURRENCIES.map((currency) => ({
                            value: currency.code,
                            label: `${currency.symbol} ${currency.name} (${currency.code})`,
                        }))}
                        updateSettings={updatePriceFetchingSettings}
                        onValueChange={(value) => {
                            // Also update UI currency if different
                            if (selectedCurrency.code !== value) {
                                setCurrency(value);
                            }
                        }}
                    />

                    <SettingsFormFields.Select
                        form={form}
                        name="cacheTtl"
                        label="Cache Duration"
                        description="How often to refresh price data from CoinGecko"
                        placeholder="Select cache duration"
                        options={[
                            { value: "1", label: "1 minute" },
                            { value: "5", label: "5 minutes" },
                            { value: "10", label: "10 minutes" },
                            { value: "15", label: "15 minutes" },
                            { value: "30", label: "30 minutes" },
                            { value: "60", label: "60 minutes" },
                        ]}
                        updateSettings={(settings) => {
                            // Convert string value to number for cacheTtl
                            const cacheTtlValue = settings.cacheTtl;
                            if (typeof cacheTtlValue === "string") {
                                updatePriceFetchingSettings({
                                    cacheTtl: parseInt(cacheTtlValue, 10),
                                });
                            } else {
                                updatePriceFetchingSettings(settings);
                            }
                        }}
                    />

                    <SettingsFormFields.Separator />
                </SettingsFormFields.Card>
            </BaseSettingsForm>

            {/* Price Status */}
            {priceFetchingSettings?.enabled && (
                <Card>
                    <CardHeader>
                        <CardTitle>Price Status</CardTitle>
                        <CardDescription>
                            Current price fetching status and cache information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Status:
                                </span>
                                <span
                                    className={`ml-2 font-medium ${isPollingActive ? "text-green-600" : "text-orange-600"}`}
                                >
                                    {isPollingActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Cache:
                                </span>
                                <span
                                    className={`ml-2 font-medium ${isCacheValid ? "text-green-600" : "text-red-600"}`}
                                >
                                    {isCacheValid ? "Valid" : "Expired"}
                                </span>
                            </div>
                        </div>

                        {priceFetchingSettings.lastFetched && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">
                                    Last Updated:
                                </span>
                                <span className="ml-2">
                                    {new Date(
                                        priceFetchingSettings.lastFetched,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {cacheExpiryTime && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">
                                    Cache Expires:
                                </span>
                                <span className="ml-2">
                                    {cacheExpiryTime.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshPrices}
                            disabled={!priceFetchingSettings.enabled}
                            className="w-full"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Prices Now
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
