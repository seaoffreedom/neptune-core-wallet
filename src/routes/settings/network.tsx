import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { NetworkSettingsForm } from '@/components/settings/network-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type NetworkSettingsFormData,
  networkSettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';

export const Route = createFileRoute('/settings/network')({
  component: NetworkSettings,
});

function NetworkSettings() {
  const { form, isLoading } = useSettingsForm<NetworkSettingsFormData>({
    category: 'network',
    schema: networkSettingsSchema,
  });

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Network Settings</h1>
          <p className="text-muted-foreground">
            Configure peer connections, ports, and network parameters for
            Neptune Core.
          </p>
        </div>

        {/* Network Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <NetworkSettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
