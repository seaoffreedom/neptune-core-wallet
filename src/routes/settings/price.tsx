/**
 * Price Settings Route
 *
 * Settings page for configuring price fetching functionality.
 */

import { createFileRoute } from '@tanstack/react-router';
import { PriceSettingsForm } from '@/components/settings/price-settings-form';
import { usePricePolling } from '@/renderer/hooks/use-price-polling';

function PriceSettingsPage() {
    // Initialize price polling when this page is loaded
    usePricePolling();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Price Settings</h1>
                <p className="text-muted-foreground">
                    Configure live price fetching to display fiat values for your Neptune balance.
                </p>
            </div>
            
            <PriceSettingsForm />
        </div>
    );
}

export const Route = createFileRoute('/settings/price')({
    component: PriceSettingsPage,
});
