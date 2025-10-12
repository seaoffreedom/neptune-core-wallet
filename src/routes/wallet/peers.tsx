import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActivePeersSection } from "@/components/peers/active-peers-section";
import { BannedPeersSection } from "@/components/peers/banned-peers-section";
import { CliPeersSection } from "@/components/peers/cli-peers-section";
import { ListSkeleton } from "@/components/ui/skeleton-enhanced";
import { usePeerStore } from "@/renderer/stores/peer-store";
import { useNetworkSettings } from "@/store/neptune-core-settings.store";

function PeerManager() {
    const { activePeers, bannedPeers, isLoading, loadPeers } = usePeerStore();
    const networkSettings = useNetworkSettings();

    useEffect(() => {
        console.log("🔄 PeerManager useEffect triggered", {
            network: networkSettings?.network,
            networkSettings: networkSettings,
            activePeers: activePeers.length,
            bannedPeers: bannedPeers.length,
        });
        if (networkSettings?.network) {
            console.log(
                "📡 Loading peers for network:",
                networkSettings.network,
            );
            loadPeers(networkSettings.network);
        } else {
            console.log(
                "⚠️ No network setting found, using 'main' as fallback",
            );
            loadPeers("main");
        }
    }, [networkSettings?.network, loadPeers]);

    // Determine if we're in initial loading state (no data yet and currently loading)
    const isInitialLoading =
        isLoading && activePeers.length === 0 && bannedPeers.length === 0;

    console.log("🎨 Rendering PeerManager", {
        activePeers: activePeers.length,
        bannedPeers: bannedPeers.length,
        isLoading,
        isInitialLoading,
    });

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold">Peer Manager</h3>
                    <p className="text-muted-foreground">
                        Discover connected peers via CLI and manage your Neptune
                        Core peer connections. (Active: {activePeers.length},
                        Banned: {bannedPeers.length})
                    </p>
                </div>

                {isInitialLoading ? (
                    <div className="space-y-6">
                        {/* Active peers skeleton */}
                        <div className="rounded-md border p-4">
                            <div className="space-y-4">
                                <div className="h-6 w-48 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <ListSkeleton items={3} />
                            </div>
                        </div>
                        {/* Banned peers skeleton */}
                        <div className="rounded-md border p-4">
                            <div className="space-y-4">
                                <div className="h-6 w-48 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <ListSkeleton items={1} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <CliPeersSection />
                        <ActivePeersSection
                            peers={activePeers}
                            network={networkSettings?.network || "main"}
                        />
                        <BannedPeersSection
                            peers={bannedPeers}
                            network={networkSettings?.network || "main"}
                        />
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/peers")({
    component: PeerManager,
});
