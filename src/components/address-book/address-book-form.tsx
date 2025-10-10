/**
 * Address Book Entry Form
 *
 * Form for creating and editing address book entries
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
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
import { Textarea } from '@/components/ui/textarea';
import { useAddressValidation } from '@/renderer/hooks/use-onchain-data';
import type { AddressBookEntry } from '@/shared/types/api-types';

// Form validation schema
const addressBookFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(50, { message: 'Name must be less than 50 characters' }),
  description: z
    .string()
    .max(200, { message: 'Description must be less than 200 characters' })
    .optional(),
  address: z
    .string()
    .min(1, { message: 'Neptune address is required' })
    .refine((val) => val.trim().length > 0, {
      message: 'Address cannot be empty',
    }),
});

type AddressBookFormValues = z.infer<typeof addressBookFormSchema>;

interface AddressBookFormProps {
  entry?: AddressBookEntry | null;
  onSubmit: (values: AddressBookFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddressBookForm({
  entry,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddressBookFormProps) {
  const { validateAddress } = useAddressValidation();
  const isEditMode = !!entry;

  const form = useForm<AddressBookFormValues>({
    resolver: zodResolver(addressBookFormSchema),
    defaultValues: {
      title: entry?.title || '',
      description: entry?.description || '',
      address: entry?.address || '',
    },
  });

  // Update form when entry changes
  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        description: entry.description,
        address: entry.address,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        address: '',
      });
    }
  }, [entry, form]);

  const handleSubmit = async (values: AddressBookFormValues) => {
    // Validate address via RPC
    const isValidAddress = await validateAddress(values.address);

    if (!isValidAddress) {
      form.setError('address', {
        type: 'manual',
        message: 'Invalid Neptune address format',
      });
      return;
    }

    await onSubmit(values);
  };

  return (
    <Card className="bg-primary/2">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Address' : 'Add New Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Name Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Field>
                      <Input placeholder="e.g., Alice's Wallet" {...field} />
                    </Field>
                  </FormControl>
                  <FormDescription>
                    A friendly name for this address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neptune Address</FormLabel>
                  <FormControl>
                    <Field>
                      <Input
                        placeholder="nolus1..."
                        className="font-mono"
                        {...field}
                      />
                    </Field>
                  </FormControl>
                  <FormDescription>The Neptune address to save</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this address..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes or description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
            </ButtonGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
