import { CheckCircle2, CloudOff, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnchainStore } from "@/store/onchain.store";

export function FooterIcon() {
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const blockHeight = useOnchainStore((state) => state.blockHeight);

    const isLoading = !dashboardData;
    const isSyncing = dashboardData?.syncing ?? false;

    // Consider connected if we have a block height > 0 (means we're receiving data)
    const isConnected = blockHeight !== null && parseInt(blockHeight, 10) > 0;

    const renderIcon = () => {
        if (isLoading) {
            return <Skeleton className="h-5 w-5 rounded-full" />;
        }

        // Check connection first - if no block height, show disconnected
        if (!isConnected) {
            return <CloudOff className="h-5 w-5 text-red-500" />;
        }

        // If syncing is true, show spinner
        if (isSyncing) {
            return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
        }

        // If syncing is false and we have block data, we're synced
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    };

    return (
        <div className="w-16 flex items-center justify-center border-r border-border">
            {renderIcon()}
        </div>
    );
}
