import { Info, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useOnchainStore } from "@/store/onchain.store";

export function FooterLeft() {
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const blockHeight = useOnchainStore((state) => state.blockHeight);
    const network = useOnchainStore((state) => state.network);
    const peerInfo = useOnchainStore((state) => state.peerInfo);

    // Memoize the core status values to prevent unnecessary recalculations
    // Only recalculate when the actual sync status or connection state changes
    const coreStatus = useMemo(() => {
        const isLoading = !dashboardData;
        const isSyncing = dashboardData?.syncing ?? false;
        const peerCount = peerInfo?.length || 0;
        const connectedPeers = dashboardData?.peer_count || 0;
        const isConnected =
            blockHeight !== null && parseInt(blockHeight, 10) > 0;
        const hasPeers = connectedPeers > 0 || peerCount > 0;

        return {
            isLoading,
            isSyncing,
            peerCount,
            connectedPeers,
            isConnected,
            hasPeers,
        };
    }, [
        // Only depend on the actual sync status, not all dashboard data
        dashboardData?.syncing,
        dashboardData?.peer_count,
        blockHeight,
        peerInfo?.length,
        // Include dashboardData for the isLoading check, but memoization will prevent unnecessary recalculations
        dashboardData,
    ]);

    // Memoize the status info to only recalculate when core status changes
    const statusInfo = useMemo(() => {
        const { isLoading, isSyncing, connectedPeers, isConnected, hasPeers } =
            coreStatus;

        if (isLoading) {
            return {
                icon: Info,
                text: "Initializing...",
                color: "text-muted-foreground",
            };
        }

        if (!isConnected) {
            return {
                icon: WifiOff,
                text: "Disconnected",
                color: "text-red-500",
            };
        }

        if (isConnected && !hasPeers) {
            return {
                icon: AlertTriangle,
                text: "No Peers",
                color: "text-orange-500",
            };
        }

        if (isSyncing) {
            return {
                icon: Wifi,
                text: `Syncing (${connectedPeers} peers)`,
                color: "text-yellow-500",
            };
        }

        return {
            icon: Wifi,
            text: `Synced (${connectedPeers} peers)`,
            color: "text-green-500",
        };
    }, [coreStatus]);

    const IconComponent = statusInfo.icon;

    return (
        <div className="flex items-center space-x-2">
            <IconComponent className={`h-4 w-4 ${statusInfo.color}`} />
            <span className={`text-sm ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
            {network && (
                <span className="text-xs text-muted-foreground">
                    ({network})
                </span>
            )}
        </div>
    );
}
