import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdvancedSettingsForm } from '@/components/settings/advanced-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type AdvancedSettingsFormData,
  advancedSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';
import { useAdvancedSettings } from '@/store/neptune-core-settings.store';

export const Route = createFileRoute('/settings/advanced')({
  component: AdvancedSettings,
});

function AdvancedSettings() {
  const { form, isLoading } = useSettingsForm<AdvancedSettingsFormData>({
    category: 'advanced',
    schema: advancedSettingsSchema,
  });

  // Watch for Zustand store changes and reset form accordingly
  const advancedSettings = useAdvancedSettings();
  useEffect(() => {
    if (advancedSettings && !isLoading) {
      form.reset(advancedSettings);
    }
  }, [advancedSettings, form, isLoading]);

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Advanced Settings</h1>
          <p className="text-muted-foreground">
            Configure advanced options including block notifications.
          </p>
        </div>

        {/* Advanced Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <AdvancedSettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
