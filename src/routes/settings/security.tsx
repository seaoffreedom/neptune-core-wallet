import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { SecuritySettingsForm } from '@/components/settings/security-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type SecuritySettingsFormData,
  securitySettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';

export const Route = createFileRoute('/settings/security')({
  component: SecuritySettings,
});

function SecuritySettings() {
  const { form, isLoading } = useSettingsForm<SecuritySettingsFormData>({
    category: 'security',
    schema: securitySettingsSchema,
  });

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">
            Configure security parameters including authentication, scanning,
            and notifications.
          </p>
        </div>

        {/* Security Settings Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <SecuritySettingsForm form={form} />
        )}
      </div>
    </PageContainer>
  );
}
