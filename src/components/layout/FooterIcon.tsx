import { AlertTriangle, CheckCircle2, CloudOff, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOnchainStore } from '@/store/onchain.store';

export function FooterIcon() {
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
    const isConnected = blockHeight !== null && parseInt(blockHeight, 10) > 0;
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
        icon: null,
        color: '',
        text: 'Loading...',
        tooltip: 'Initializing connection...',
      };
    }

    // Check connection first - if no block height, show disconnected
    if (!isConnected) {
      return {
        icon: CloudOff,
        color: 'text-red-500',
        text: 'Disconnected',
        tooltip: 'No connection to Neptune network',
      };
    }

    // If we have connection but no peers, show warning
    if (isConnected && !hasPeers) {
      return {
        icon: AlertTriangle,
        color: 'text-orange-500',
        text: 'No Peers',
        tooltip: 'Connected but no peers available',
      };
    }

    // If syncing is true, show spinner
    if (isSyncing) {
      return {
        icon: Loader2,
        color: 'text-yellow-500',
        text: 'Syncing',
        tooltip: `Syncing blockchain data... (${connectedPeers} peers)`,
      };
    }

    // If syncing is false and we have block data and peers, we're fully synced
    return {
      icon: CheckCircle2,
      color: 'text-green-500',
      text: 'Synced',
      tooltip: `Fully synced (${connectedPeers} peers, ${network} network)`,
    };
  }, [coreStatus, network]);

  const IconComponent = statusInfo.icon;

  const renderIcon = () => {
    if (coreStatus.isLoading) {
      return <Skeleton className="h-5 w-5 rounded-full" />;
    }

    if (!IconComponent) return null;

    return (
      <IconComponent
        className={`h-5 w-5 ${statusInfo.color} ${coreStatus.isSyncing ? 'animate-spin' : ''}`}
      />
    );
  };

  return (
    <div
      className="w-16 flex items-center justify-center border-r border-border cursor-help"
      title={statusInfo.tooltip}
    >
      {renderIcon()}
    </div>
  );
}
