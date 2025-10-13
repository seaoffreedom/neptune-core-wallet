/**
 * Price Display Component
 *
 * Displays fiat price conversion for NPT amounts.
 * Shows price in the selected currency when price fetching is enabled.
 */

import { useEffect, useState } from 'react';
import { usePriceDisplay, usePriceConfig, usePriceData } from '@/store/price.store';
import { priceAPI } from '@/preload/api/price-api';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceDisplayProps {
    nptAmount: number;
    currency?: 'usd' | 'eur' | 'gbp';
    className?: string;
    showCurrency?: boolean;
    precision?: number;
}

export function PriceDisplay({ 
    nptAmount, 
    currency, 
    className = '', 
    showCurrency = true,
    precision = 2 
}: PriceDisplayProps) {
    // Note: precision parameter is reserved for future use
    void precision;
    const config = usePriceConfig();
    const cachedPrices = usePriceData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get formatted price from store
    const formattedPrice = usePriceDisplay(nptAmount, currency);

    // Fetch prices if enabled and no cached data
    useEffect(() => {
        if (!config.enabled || cachedPrices || isLoading) return;

        const fetchPrices = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const result = await priceAPI.getCurrentPrices();
                if (!result.success) {
                    setError(result.error || 'Failed to fetch prices');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrices();
    }, [config.enabled, cachedPrices, isLoading]);

    // Don't render if price fetching is disabled
    if (!config.enabled) {
        return null;
    }

    // Show loading skeleton
    if (isLoading) {
        return (
            <Skeleton className={`h-4 w-16 ${className}`} />
        );
    }

    // Show error state
    if (error) {
        return (
            <span className={`text-xs text-muted-foreground ${className}`} title={error}>
                Price unavailable
            </span>
        );
    }

    // Show formatted price
    if (formattedPrice) {
        const targetCurrency = currency || config.selectedCurrency;
        const currencySymbol = showCurrency ? getCurrencySymbol(targetCurrency) : '';
        
        return (
            <span className={`text-xs text-muted-foreground ${className}`}>
                {currencySymbol}{formattedPrice}
            </span>
        );
    }

    // No price data available
    return (
        <span className={`text-xs text-muted-foreground ${className}`}>
            Price unavailable
        </span>
    );
}

/**
 * Get currency symbol for display
 */
function getCurrencySymbol(currency: 'usd' | 'eur' | 'gbp'): string {
    switch (currency) {
        case 'usd':
            return '$';
        case 'eur':
            return '€';
        case 'gbp':
            return '£';
        default:
            return '';
    }
}

/**
 * Compact price display for small spaces
 */
export function CompactPriceDisplay({ 
    nptAmount, 
    currency, 
    className = '' 
}: Omit<PriceDisplayProps, 'showCurrency' | 'precision'>) {
    return (
        <PriceDisplay
            nptAmount={nptAmount}
            currency={currency}
            className={className}
            showCurrency={false}
            precision={2}
        />
    );
}

/**
 * Full price display with currency symbol
 */
export function FullPriceDisplay({ 
    nptAmount, 
    currency, 
    className = '' 
}: Omit<PriceDisplayProps, 'showCurrency' | 'precision'>) {
    return (
        <PriceDisplay
            nptAmount={nptAmount}
            currency={currency}
            className={className}
            showCurrency={true}
            precision={2}
        />
    );
}
