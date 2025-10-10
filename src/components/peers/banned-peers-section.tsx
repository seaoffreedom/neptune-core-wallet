/**
 * Banned Peers Section
 *
 * Displays and manages banned peers
 */

import { useState } from "react";
import type { PeerEntry } from "@/main/stores/peer-store";
import { BannedPeerTable } from "./banned-peer-table";
import { DeletePeerDialog } from "./delete-peer-dialog";
import { PeersEmpty } from "./peers-empty";

interface BannedPeersSectionProps {
    peers: PeerEntry[];
}

export function BannedPeersSection({ peers }: BannedPeersSectionProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState<PeerEntry | null>(null);

    const handleDelete = (peer: PeerEntry) => {
        setSelectedPeer(peer);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-lg font-semibold">Banned Peers</h4>
                <p className="text-sm text-muted-foreground">
                    {peers.length} {peers.length === 1 ? "peer" : "peers"}{" "}
                    banned
                </p>
            </div>

            {peers.length === 0 ? (
                <PeersEmpty type="banned" />
            ) : (
                <BannedPeerTable peers={peers} onDelete={handleDelete} />
            )}

            {/* Delete Peer Dialog */}
            <DeletePeerDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                peer={selectedPeer}
            />
        </div>
    );
}
