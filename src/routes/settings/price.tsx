import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { PriceSettingsForm } from '@/components/settings/price-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import { priceSettingsSchema } from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';
import type { PriceSettingsFormData } from '@/shared/types/settings-forms';

export const Route = createFileRoute('/settings/price')({
  component: PriceSettings,
});

function PriceSettings() {
  const { form, isLoading } = useSettingsForm<PriceSettingsFormData>({
    category: 'priceFetching',
    schema: priceSettingsSchema,
  });

  // The useSettingsForm hook now handles form initialization and data conversion

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Price & Currency Settings</h1>
          <p className="text-muted-foreground">
            Configure price fetching from CoinGecko, currency display
            preferences, and market data caching.
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
