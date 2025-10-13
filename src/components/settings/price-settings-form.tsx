/**
 * Price Settings Form Component
 *
 * Form for configuring price fetching settings including enable/disable toggle,
 * currency selection, and cache TTL configuration.
 */

import type { useForm } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    usePriceFetchingSettings,
    useUpdatePriceFetchingSettings,
} from "@/store/neptune-core-settings.store";
import {
    useSelectedCurrency,
    useSetCurrency,
    AVAILABLE_CURRENCIES,
} from "@/store/ui.store";
import {
    usePricePolling,
    useIsPriceCacheValid,
    useCacheExpiryTime,
} from "@/hooks/use-price-polling";
import type { PriceSettingsFormData } from "@/lib/validation/settings-schemas";
import { DollarSign, Clock, RefreshCw } from "lucide-react";

interface PriceSettingsFormProps {
    form: ReturnType<typeof useForm<PriceSettingsFormData>>;
}

export function PriceSettingsForm({ form }: PriceSettingsFormProps) {
    const priceFetchingSettings = usePriceFetchingSettings();
    const updatePriceFetchingSettings = useUpdatePriceFetchingSettings();
    const { selectedCurrency } = useSelectedCurrency();
    const setCurrency = useSetCurrency();
    const { isPollingActive, fetchAndUpdatePrices } = usePricePolling();
    const isCacheValid = useIsPriceCacheValid();
    const cacheExpiryTime = useCacheExpiryTime();

    const onSubmit = (data: PriceSettingsFormData) => {
        console.log("💰 Price settings form submitted:", data);

        // Update price fetching settings
        updatePriceFetchingSettings({
            enabled: data.enabled,
            currency: data.currency,
            cacheTtl: data.cacheTtl,
        });

        // Update UI currency if different
        if (selectedCurrency.code !== data.currency) {
            setCurrency(data.currency);
        }
    };

    const handleRefreshPrices = async () => {
        console.log("🔄 Manually refreshing prices...");
        await fetchAndUpdatePrices();
    };

    return (
        <div className="space-y-6">
            {/* Price Fetching Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Price Fetching
                    </CardTitle>
                    <CardDescription>
                        Configure automatic price fetching from CoinGecko API
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Enable Price Fetching */}
                            <FormField
                                control={form.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Enable Price Fetching
                                            </FormLabel>
                                            <FormDescription>
                                                Automatically fetch Neptune
                                                prices from CoinGecko API
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Currency Selection */}
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Currency</FormLabel>
                                         <Select
                                             onValueChange={field.onChange}
                                             defaultValue={field.value || "USD"}
                                         >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {AVAILABLE_CURRENCIES.map(
                                                    (currency) => (
                                                        <SelectItem
                                                            key={currency.code}
                                                            value={
                                                                currency.code
                                                            }
                                                        >
                                                            {currency.symbol}{" "}
                                                            {currency.name} (
                                                            {currency.code})
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Currency to display for price
                                            conversions
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Cache TTL */}
                            <FormField
                                control={form.control}
                                name="cacheTtl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Cache Duration
                                        </FormLabel>
                                         <Select
                                             onValueChange={(value) =>
                                                 field.onChange(parseInt(value))
                                             }
                                             defaultValue={field.value?.toString() || "5"}
                                         >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select cache duration" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    1 minute
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    5 minutes
                                                </SelectItem>
                                                <SelectItem value="10">
                                                    10 minutes
                                                </SelectItem>
                                                <SelectItem value="15">
                                                    15 minutes
                                                </SelectItem>
                                                <SelectItem value="30">
                                                    30 minutes
                                                </SelectItem>
                                                <SelectItem value="60">
                                                    60 minutes
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            How often to refresh price data from
                                            CoinGecko
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            {/* Submit Button */}
                            <Button type="submit" className="w-full">
                                Save Price Settings
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

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
