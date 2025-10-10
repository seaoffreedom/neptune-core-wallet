import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SecuritySettingsForm } from '@/components/settings/security-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type SecuritySettingsFormData,
  securitySettingsSchema,
} from '@/lib/validation/settings-schemas';
import { useSettingsForm } from '@/renderer/hooks/use-settings-form';
import { useSecuritySettings } from '@/store/neptune-core-settings.store';

export const Route = createFileRoute('/settings/security')({
  component: SecuritySettings,
});

function SecuritySettings() {
  const { form, isLoading } = useSettingsForm<SecuritySettingsFormData>({
    category: 'security',
    schema: securitySettingsSchema,
  });

  // Watch for Zustand store changes and reset form accordingly
  const securitySettings = useSecuritySettings();
  useEffect(() => {
    if (securitySettings && !isLoading) {
      form.reset(securitySettings);
    }
  }, [securitySettings, form, isLoading]);

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
