/**
 * Price Display Component
 *
 * Reusable component that shows fiat price conversion for NPT amounts.
 * Uses balance data from onchain store and price data from price fetching settings.
 * Conditionally renders based on price fetching enabled state.
 */

import { usePriceFetchingSettings } from "@/store/neptune-core-settings.store";
import { useSelectedCurrency } from "@/store/ui.store";

interface PriceDisplayProps {
    /** NPT amount to convert to fiat */
    nptAmount: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to show loading state */
    isLoading?: boolean;
}

/**
 * PriceDisplay component for showing fiat conversions of NPT amounts
 */
export function PriceDisplay({
    nptAmount,
    className = "",
    isLoading = false,
}: PriceDisplayProps) {
    const { selectedCurrency } = useSelectedCurrency();
    const priceFetchingSettings = usePriceFetchingSettings();

    // Don't render if price fetching is disabled
    if (!priceFetchingSettings?.enabled) {
        return null;
    }

    // Don't render if loading
    if (isLoading) {
        return (
            <span
                className={`text-xs text-muted-foreground animate-pulse ${className}`}
            >
                Loading...
            </span>
        );
    }

    // Don't render if no amount or invalid amount
    if (!nptAmount || nptAmount <= 0) {
        return null;
    }

    // Get cached prices
    const cachedPrices = priceFetchingSettings.cachedPrices;

    // Don't render if no cached prices
    if (!cachedPrices) {
        return (
            <span className={`text-xs text-muted-foreground ${className}`}>
                No price data
            </span>
        );
    }

    // Get the price for the selected currency
    const priceKey = selectedCurrency.code.toLowerCase() as
        | "usd"
        | "eur"
        | "gbp";
    const price = cachedPrices[priceKey];

    // Don't render if no price for selected currency
    if (!price || price <= 0) {
        return (
            <span className={`text-xs text-muted-foreground ${className}`}>
                No {selectedCurrency.code} price
            </span>
        );
    }

    // Calculate fiat amount
    const fiatAmount = nptAmount * price;

    // Format the amount
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: selectedCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(fiatAmount);

    return (
        <span className={`text-xs text-muted-foreground ${className}`}>
            {formatted}
        </span>
    );
}
