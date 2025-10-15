/**
 * Delete Peer Dialog
 *
 * Confirmation dialog for deleting a peer
 */

import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { PeerEntry } from '@/main/stores/peer-store';
import { usePeerStore } from '@/renderer/stores/peer-store';
import { rendererLoggers } from '../../renderer/utils/logger';

const logger = rendererLoggers.components;

interface DeletePeerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peer: PeerEntry | null;
}

export function DeletePeerDialog({
  open,
  onOpenChange,
  peer,
}: DeletePeerDialogProps) {
  const { deletePeer } = usePeerStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!peer) return;

    setIsDeleting(true);
    try {
      await deletePeer(peer.id);
      showSuccessToast(
        peer.isBanned
          ? 'Peer removed from banned list'
          : 'Peer deleted successfully'
      );
      onOpenChange(false);
    } catch (error) {
      showErrorToast(
        error instanceof Error && error.message.includes('default')
          ? 'Cannot delete default bootstrap peers'
          : 'Failed to delete peer'
      );
      logger.error('Delete peer error', {
        error: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {peer?.isBanned ? 'Remove from banned list?' : 'Delete peer?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {peer?.isBanned
              ? 'This will remove the peer from your banned list. You can add it back later as an active peer.'
              : 'This action cannot be undone. The peer will be permanently removed from your list.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">{peer?.label || 'Unnamed Peer'}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {peer?.address}
          </p>
        </div>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {peer?.isBanned ? 'Remove' : 'Delete'}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
