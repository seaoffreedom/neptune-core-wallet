/**
 * Banned Peers Section
 *
 * Displays and manages banned peers
 */

import { Ban } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { PeerEntry } from '@/main/stores/peer-store';
import { AddBannedPeerDialog } from './add-banned-peer-dialog';
import { BannedPeerTable } from './banned-peer-table';
import { DeletePeerDialog } from './delete-peer-dialog';
import { PeersEmpty } from './peers-empty';

interface BannedPeersSectionProps {
  peers: PeerEntry[];
  network: string;
}

export function BannedPeersSection({
  peers,
  network,
}: BannedPeersSectionProps) {
  const [isAddBannedDialogOpen, setIsAddBannedDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerEntry | null>(null);

  const handleDelete = (peer: PeerEntry) => {
    setSelectedPeer(peer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Banned Peers</h4>
          <p className="text-sm text-muted-foreground">
            {peers.length} {peers.length === 1 ? 'peer' : 'peers'} banned
          </p>
        </div>
        <Button
          onClick={() => setIsAddBannedDialogOpen(true)}
          size="sm"
          variant="destructive"
        >
          <Ban className="h-4 w-4 mr-2" />
          Ban Peer
        </Button>
      </div>

      {peers.length === 0 ? (
        <PeersEmpty type="banned" />
      ) : (
        <BannedPeerTable peers={peers} onDelete={handleDelete} />
      )}

      {/* Add Banned Peer Dialog */}
      <AddBannedPeerDialog
        open={isAddBannedDialogOpen}
        onOpenChange={setIsAddBannedDialogOpen}
        network={network}
      />

      {/* Delete Peer Dialog */}
      <DeletePeerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        peer={selectedPeer}
      />
    </div>
  );
}
