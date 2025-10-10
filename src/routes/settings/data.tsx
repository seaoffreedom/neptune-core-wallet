import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataSettingsForm } from '@/components/settings/data-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type DataSettingsFormData,
  dataSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';

export const Route = createFileRoute('/settings/data')({
  component: DataSettings,
});

function DataSettings() {
  const { form, isLoading } = useSettingsForm<DataSettingsFormData>({
    category: 'data',
    schema: dataSettingsSchema,
  });

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
