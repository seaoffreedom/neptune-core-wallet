import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActivePeersSection } from "@/components/peers/active-peers-section";
import { BannedPeersSection } from "@/components/peers/banned-peers-section";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeerStore } from "@/renderer/stores/peer-store";
import { useNetworkSettings } from "@/renderer/stores/neptune-core-settings-store";

function PeerManager() {
    const { activePeers, bannedPeers, isLoading, loadPeers } = usePeerStore();
    const networkSettings = useNetworkSettings();

    useEffect(() => {
        if (networkSettings?.network) {
            loadPeers(networkSettings.network);
        }
    }, [networkSettings?.network, loadPeers]);

    // Determine if we're in initial loading state (no data yet and currently loading)
    const isInitialLoading =
        isLoading && activePeers.length === 0 && bannedPeers.length === 0;

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold">Peer Manager</h3>
                    <p className="text-muted-foreground">
                        Manage your Neptune Core peer connections and banned
                        peers.
                    </p>
                </div>

                {isInitialLoading ? (
                    <div className="space-y-6">
                        {/* Active peers skeleton */}
                        <div className="rounded-md border p-4 space-y-3">
                            <Skeleton className="w-48 h-6" />
                            <Skeleton className="w-full h-16" />
                            <Skeleton className="w-full h-16" />
                            <Skeleton className="w-full h-16" />
                        </div>
                        {/* Banned peers skeleton */}
                        <div className="rounded-md border p-4 space-y-3">
                            <Skeleton className="w-48 h-6" />
                            <Skeleton className="w-full h-16" />
                        </div>
                    </div>
                ) : (
                    <>
                        <ActivePeersSection
                            peers={activePeers}
                            network={networkSettings?.network || "main"}
                        />
                        <BannedPeersSection peers={bannedPeers} />
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/peers")({
    component: PeerManager,
});
