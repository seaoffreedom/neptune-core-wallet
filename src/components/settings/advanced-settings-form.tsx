/**
 * Advanced Settings Form
 *
 * Form for configuring Neptune Core advanced settings including
 * Tokio console and block notify commands.
 */

import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AdvancedSettingsFormData } from '@/lib/validation/settings-schemas';
import { useUpdateAdvancedSettings } from '@/store/neptune-core-settings.store';

interface AdvancedSettingsFormProps {
  form: UseFormReturn<AdvancedSettingsFormData>;
}

export function AdvancedSettingsForm({ form }: AdvancedSettingsFormProps) {
  const updateAdvancedSettings = useUpdateAdvancedSettings();

  const handleFieldChange = (field: string, value: unknown) => {
    updateAdvancedSettings({
      [field]: value,
    } as Partial<AdvancedSettingsFormData>);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Block Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="blockNotifyCommand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Notify Command</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="e.g., /path/to/script.sh"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleFieldChange('blockNotifyCommand', e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Command to execute when a new block is found (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
