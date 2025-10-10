/**
 * Peers Empty State
 *
 * Displays when there are no peers to show
 */

import { Network, Shield } from "lucide-react";
import { Empty } from "@/components/ui/empty";

interface PeersEmptyProps {
    type: "active" | "banned";
}

export function PeersEmpty({ type }: PeersEmptyProps) {
    if (type === "active") {
        return (
            <Empty
                icon={<Network className="h-12 w-12" />}
                title="No active peers"
                description="Add peer connections to improve your network connectivity"
            />
        );
    }

    return (
        <Empty
            icon={<Shield className="h-12 w-12" />}
            title="No banned peers"
            description="Peers you ban will appear here"
        />
    );
}
