/**
 * Active Peers Section
 *
 * Displays and manages active (non-banned) peers
 */

import { Plus, RefreshCw, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PeerEntry } from '@/main/stores/peer-store';
import { BanPeerDialog } from './ban-peer-dialog';
import { DeletePeerDialog } from './delete-peer-dialog';
import { PeerFormDialog } from './peer-form-dialog';
import { PeerTable } from './peer-table';
import { PeersEmpty } from './peers-empty';

interface ActivePeersSectionProps {
  peers: PeerEntry[];
  network: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ActivePeersSection({
  peers,
  network,
  onRefresh,
  isRefreshing = false,
}: ActivePeersSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerEntry | null>(null);

  const handleEdit = (peer: PeerEntry) => {
    setSelectedPeer(peer);
    setIsEditDialogOpen(true);
  };

  const handleBan = (peer: PeerEntry) => {
    setSelectedPeer(peer);
    setIsBanDialogOpen(true);
  };

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
              <Users className="h-5 w-5" />
              Active Peers
            </CardTitle>
            <Badge variant="secondary">
              {peers.length} {peers.length === 1 ? 'peer' : 'peers'}
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
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Peer
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your active peer connections and network settings.
        </p>
      </CardHeader>
      <CardContent>
        {peers.length === 0 ? (
          <PeersEmpty type="active" />
        ) : (
          <PeerTable
            peers={peers}
            onEdit={handleEdit}
            onBan={handleBan}
            onDelete={handleDelete}
          />
        )}
      </CardContent>

      {/* Add Peer Dialog */}
      <PeerFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        network={network}
      />

      {/* Edit Peer Dialog */}
      <PeerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        peer={selectedPeer}
        network={network}
      />

      {/* Ban Peer Dialog */}
      <BanPeerDialog
        open={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
        peer={selectedPeer}
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
