import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { MiningSettingsForm } from '@/components/settings/mining-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type MiningSettingsFormData,
  miningSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';

export const Route = createFileRoute('/settings/mining')({
  component: MiningSettings,
});

function MiningSettings() {
  const { form, isLoading } = useSettingsForm<MiningSettingsFormData>({
    category: 'mining',
    schema: miningSettingsSchema,
  });

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Mining Settings</h1>
          <p className="text-muted-foreground">
            Configure mining parameters including proof upgrading, block
            composition, and guessing.
          </p>
        </div>

        {/* Mining Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <MiningSettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
