/**
 * Price Settings Form
 *
 * Form component for configuring price fetching settings.
 * Includes toggle for enabling/disabling price fetching and currency selection.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, TrendingUp, DollarSign, Euro, PoundSterling } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { usePriceConfig, useSetPriceConfig, usePriceData, useClearPriceCache } from '@/store/price.store';
import { priceAPI } from '@/preload/api/price-api';

// Form validation schema
const priceSettingsSchema = z.object({
    enabled: z.boolean(),
    selectedCurrency: z.enum(['usd', 'eur', 'gbp']),
    cacheTtlMinutes: z.number().min(1).max(60),
    autoRefresh: z.boolean(),
});

type PriceSettingsFormData = z.infer<typeof priceSettingsSchema>;

export function PriceSettingsForm() {
    const { toast } = useToast();
    const config = usePriceConfig();
    const setConfig = useSetPriceConfig();
    const cachedPrices = usePriceData();
    const clearCache = useClearPriceCache();
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PriceSettingsFormData>({
        resolver: zodResolver(priceSettingsSchema),
        defaultValues: {
            enabled: config.enabled,
            selectedCurrency: config.selectedCurrency,
            cacheTtlMinutes: config.cacheTtlMinutes,
            autoRefresh: config.autoRefresh,
        },
    });

    // Update form when config changes
    useEffect(() => {
        form.reset({
            enabled: config.enabled,
            selectedCurrency: config.selectedCurrency,
            cacheTtlMinutes: config.cacheTtlMinutes,
            autoRefresh: config.autoRefresh,
        });
    }, [config, form]);

    // Handle form submission
    const onSubmit = async (data: PriceSettingsFormData) => {
        setIsSaving(true);
        try {
            // Update local store
            setConfig(data);
            
            // Update main process configuration
            const result = await priceAPI.updateConfig(data);
            
            if (result.success) {
                toast({
                    title: 'Price settings updated',
                    description: 'Your price fetching preferences have been saved.',
                });
            } else {
                throw new Error(result.error || 'Failed to update price settings');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({
                title: 'Error updating settings',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle manual price refresh
    const handleRefreshPrices = async () => {
        setIsRefreshing(true);
        try {
            const result = await priceAPI.refreshPrices();
            
            if (result.success) {
                toast({
                    title: 'Prices refreshed',
                    description: 'Latest price data has been fetched from CoinGecko.',
                });
            } else {
                throw new Error(result.error || 'Failed to refresh prices');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({
                title: 'Error refreshing prices',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // Handle clear cache
    const handleClearCache = async () => {
        try {
            const result = await priceAPI.clearCache();
            
            if (result.success) {
                clearCache();
                toast({
                    title: 'Cache cleared',
                    description: 'Price cache has been cleared successfully.',
                });
            } else {
                throw new Error(result.error || 'Failed to clear cache');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({
                title: 'Error clearing cache',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const getCurrencyIcon = (currency: string) => {
        switch (currency) {
            case 'usd':
                return <DollarSign className="h-4 w-4" />;
            case 'eur':
                return <Euro className="h-4 w-4" />;
            case 'gbp':
                return <PoundSterling className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const getCurrencyName = (currency: string) => {
        switch (currency) {
            case 'usd':
                return 'US Dollar';
            case 'eur':
                return 'Euro';
            case 'gbp':
                return 'British Pound';
            default:
                return 'US Dollar';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Price Fetching Settings
                </CardTitle>
                <CardDescription>
                    Configure live price fetching from CoinGecko to display fiat values for your Neptune balance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Enable/Disable Price Fetching */}
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
                                            Fetch live Neptune prices from CoinGecko to display fiat values
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
                            name="selectedCurrency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Currency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="usd">
                                                <div className="flex items-center gap-2">
                                                    {getCurrencyIcon('usd')}
                                                    {getCurrencyName('usd')} (USD)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="eur">
                                                <div className="flex items-center gap-2">
                                                    {getCurrencyIcon('eur')}
                                                    {getCurrencyName('eur')} (EUR)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="gbp">
                                                <div className="flex items-center gap-2">
                                                    {getCurrencyIcon('gbp')}
                                                    {getCurrencyName('gbp')} (GBP)
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the default currency for price display
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Cache TTL */}
                        <FormField
                            control={form.control}
                            name="cacheTtlMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cache Duration (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="60"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        How long to cache price data before fetching new prices (1-60 minutes)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Auto Refresh */}
                        <FormField
                            control={form.control}
                            name="autoRefresh"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Auto Refresh
                                        </FormLabel>
                                        <FormDescription>
                                            Automatically refresh prices at the specified interval
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

                        <Separator />

                        {/* Current Price Display */}
                        {config.enabled && cachedPrices && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Current Prices</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        {getCurrencyIcon('usd')}
                                        <span>${cachedPrices.usd.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getCurrencyIcon('eur')}
                                        <span>€{cachedPrices.eur.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getCurrencyIcon('gbp')}
                                        <span>£{cachedPrices.gbp.toFixed(4)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last updated: {cachedPrices.lastFetched.toLocaleString()}
                                </p>
                            </div>
                        )}

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRefreshPrices}
                                disabled={!config.enabled || isRefreshing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
                            </Button>
                            
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearCache}
                                disabled={!config.enabled}
                            >
                                Clear Cache
                            </Button>
                            
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="ml-auto"
                            >
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
