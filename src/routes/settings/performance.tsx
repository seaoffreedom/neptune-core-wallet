import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PerformanceSettingsForm } from '@/components/settings/performance-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type PerformanceSettingsFormData,
  performanceSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';
import { usePerformanceSettings } from '@/store/neptune-core-settings.store';

export const Route = createFileRoute('/settings/performance')({
  component: PerformanceSettings,
});

function PerformanceSettings() {
  const { form, isLoading } = useSettingsForm<PerformanceSettingsFormData>({
    category: 'performance',
    schema: performanceSettingsSchema,
  });

  // Watch for Zustand store changes and reset form accordingly
  const performanceSettings = usePerformanceSettings();
  useEffect(() => {
    if (performanceSettings && !isLoading) {
      form.reset(performanceSettings);
    }
  }, [performanceSettings, form, isLoading]);

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Performance Settings</h1>
          <p className="text-muted-foreground">
            Configure performance parameters including proofs, sync mode, and
            mempool.
          </p>
        </div>

        {/* Performance Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <PerformanceSettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
