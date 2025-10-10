/**
 * Active Peers Section
 *
 * Displays and manages active (non-banned) peers
 */

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PeerEntry } from "@/main/stores/peer-store";
import { PeerTable } from "./peer-table";
import { PeerFormDialog } from "./peer-form-dialog";
import { BanPeerDialog } from "./ban-peer-dialog";
import { DeletePeerDialog } from "./delete-peer-dialog";
import { PeersEmpty } from "./peers-empty";

interface ActivePeersSectionProps {
    peers: PeerEntry[];
    network: string;
}

export function ActivePeersSection({
    peers,
    network,
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-lg font-semibold">Active Peers</h4>
                    <p className="text-sm text-muted-foreground">
                        {peers.length} {peers.length === 1 ? "peer" : "peers"}{" "}
                        connected
                    </p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Peer
                </Button>
            </div>

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
        </div>
    );
}
