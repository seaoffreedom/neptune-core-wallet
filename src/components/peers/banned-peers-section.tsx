/**
 * Banned Peers Section
 *
 * Displays and manages banned peers
 */

import { Ban, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PeerEntry } from '@/main/stores/peer-store';
import { AddBannedPeerDialog } from './add-banned-peer-dialog';
import { BannedPeerTable } from './banned-peer-table';
import { DeletePeerDialog } from './delete-peer-dialog';
import { PeersEmpty } from './peers-empty';

interface BannedPeersSectionProps {
  peers: PeerEntry[];
  network: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function BannedPeersSection({
  peers,
  network,
  onRefresh,
  isRefreshing = false,
}: BannedPeersSectionProps) {
  const [isAddBannedDialogOpen, setIsAddBannedDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerEntry | null>(null);

  const handleDelete = (peer: PeerEntry) => {
    setSelectedPeer(peer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Banned Peers
            </CardTitle>
            <Badge variant="destructive">
              {peers.length} {peers.length === 1 ? 'peer' : 'peers'} banned
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            )}
            <Button
              onClick={() => setIsAddBannedDialogOpen(true)}
              size="sm"
              variant="destructive"
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban Peer
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage banned peers and network security settings.
        </p>
      </CardHeader>
      <CardContent>
        {peers.length === 0 ? (
          <PeersEmpty type="banned" />
        ) : (
          <BannedPeerTable peers={peers} onDelete={handleDelete} />
        )}
      </CardContent>

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
    </Card>
  );
}
