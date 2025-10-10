import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataSettingsForm } from '@/components/settings/data-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type DataSettingsFormData,
  dataSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';
import { useDataSettings } from '@/store/neptune-core-settings.store';

export const Route = createFileRoute('/settings/data')({
  component: DataSettings,
});

function DataSettings() {
  const { form, isLoading } = useSettingsForm<DataSettingsFormData>({
    category: 'data',
    schema: dataSettingsSchema,
  });

  // Watch for Zustand store changes and reset form accordingly
  const dataSettings = useDataSettings();
  useEffect(() => {
    if (dataSettings && !isLoading) {
      form.reset(dataSettings);
    }
  }, [dataSettings, form, isLoading]);

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Data & Storage Settings</h1>
          <p className="text-muted-foreground">
            Configure data directory, block import, and storage options.
          </p>
        </div>

        {/* Data Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <DataSettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
