/**
 * Ban Peer Dialog
 *
 * Dialog for banning a peer with optional reason
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { PeerEntry } from '@/main/stores/peer-store';
import { usePeerStore } from '@/renderer/stores/peer-store';
import { rendererLoggers } from '../../renderer/utils/logger';

const logger = rendererLoggers.components;

const banFormSchema = z.object({
  reason: z
    .string()
    .max(200, { message: 'Reason must be less than 200 characters' })
    .optional(),
});

type BanFormValues = z.infer<typeof banFormSchema>;

interface BanPeerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peer: PeerEntry | null;
}

export function BanPeerDialog({
  open,
  onOpenChange,
  peer,
}: BanPeerDialogProps) {
  const { banPeer } = usePeerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleSubmit = async (values: BanFormValues) => {
    if (!peer) return;

    setIsSubmitting(true);
    try {
      await banPeer(peer.id, values.reason);
      showSuccessToast('Peer banned successfully');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      showErrorToast('Failed to ban peer');
      logger.error('Ban peer error', { error: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ban Peer</DialogTitle>
          <DialogDescription>
            Ban this peer from connecting to your node. You can optionally
            provide a reason.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">
                {peer?.label || 'Unnamed Peer'}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {peer?.address}
              </p>
            </div>

            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Field>
                      <Textarea
                        placeholder="Why are you banning this peer?"
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
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Banning...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Ban Peer
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
