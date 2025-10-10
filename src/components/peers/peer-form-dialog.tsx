/**
 * Peer Form Dialog
 *
 * Dialog for adding and editing peer entries
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { PeerEntry } from '@/main/stores/peer-store';
import { usePeerStore } from '@/renderer/stores/peer-store';

// Form validation schema
const peerFormSchema = z.object({
  label: z
    .string()
    .max(50, { message: 'Label must be less than 50 characters' })
    .optional(),
  address: z
    .string()
    .min(1, { message: 'Address is required' })
    .regex(/^(\[?[a-zA-Z0-9\-.:]+\]?):(\d{1,5})$/, {
      message: 'Invalid address format (use IP:PORT or domain:port)',
    }),
  notes: z
    .string()
    .max(200, { message: 'Notes must be less than 200 characters' })
    .optional(),
});

type PeerFormValues = z.infer<typeof peerFormSchema>;

interface PeerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peer?: PeerEntry | null;
  network: string;
}

export function PeerFormDialog({
  open,
  onOpenChange,
  peer,
  network,
}: PeerFormDialogProps) {
  const { addPeer, updatePeer } = usePeerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!peer;

  const form = useForm<PeerFormValues>({
    resolver: zodResolver(peerFormSchema),
    defaultValues: {
      label: peer?.label || '',
      address: peer?.address || '',
      notes: peer?.notes || '',
    },
  });

  // Update form when peer changes
  useEffect(() => {
    if (peer) {
      form.reset({
        label: peer.label || '',
        address: peer.address,
        notes: peer.notes || '',
      });
    } else {
      form.reset({
        label: '',
        address: '',
        notes: '',
      });
    }
  }, [peer, form]);

  const handleSubmit = async (values: PeerFormValues) => {
    setIsSubmitting(true);
    try {
      // Validate address format via RPC
      const isValid = await window.electronAPI.peer.validate(values.address);
      if (!isValid) {
        form.setError('address', {
          type: 'manual',
          message: 'Invalid peer address format',
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditMode && peer) {
        // Update existing peer
        await updatePeer(peer.id, {
          label: values.label,
          notes: values.notes,
        });
        showSuccessToast('Peer updated successfully');
      } else {
        // Add new peer
        await addPeer({
          ...values,
          type: 'manual',
          enabled: true,
          network: network as 'main' | 'testnet' | 'regtest',
          isDefault: false,
          isBanned: false,
        });
        showSuccessToast('Peer added successfully');
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      showErrorToast(
        isEditMode ? 'Failed to update peer' : 'Failed to add peer'
      );
      console.error('Peer form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Peer' : 'Add New Peer'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the peer information below.'
              : 'Add a new peer connection to your Neptune node.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Field>
                      <Input
                        placeholder="e.g., 51.15.139.238:9798"
                        className="font-mono"
                        disabled={isEditMode}
                        {...field}
                      />
                    </Field>
                  </FormControl>
                  <FormDescription>
                    IP address or domain with port (IP:PORT)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Label Field */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (Optional)</FormLabel>
                  <FormControl>
                    <Field>
                      <Input placeholder="e.g., Bootstrap Node 1" {...field} />
                    </Field>
                  </FormControl>
                  <FormDescription>
                    A friendly name for this peer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Field>
                      <Textarea
                        placeholder="Add any notes about this peer..."
                        rows={3}
                        {...field}
                      />
                    </Field>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update' : 'Add Peer'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
