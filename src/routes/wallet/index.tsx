import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  BalanceCard,
  QuickStatsGrid,
  RecentActivity,
} from '@/components/wallet';
import { useUtxos } from '@/renderer/hooks/use-onchain-data';
import { useOnchainStore } from '@/store/onchain.store';

function WalletOverview() {
  // Get data from Zustand store
  const dashboardData = useOnchainStore((state) => state.dashboardData);
  const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);
  const unconfirmedBalance = useOnchainStore(
    (state) => state.unconfirmedBalance
  );
  const blockHeight = useOnchainStore((state) => state.blockHeight);
  const peerInfo = useOnchainStore((state) => state.peerInfo);
  const transactionHistory = useOnchainStore(
    (state) => state.transactionHistory
  );
  const mempoolTxCount = useOnchainStore((state) => state.mempoolTxCount);
  const mempoolSize = useOnchainStore((state) => state.mempoolSize);

  // Get UTXO data (fetched globally via auto-polling)
  const { utxos, calculateSummary } = useUtxos();

  const isLoading = !dashboardData;

  // Calculate pending amount
  const confirmed = confirmedBalance ? parseFloat(confirmedBalance) : 0;
  const unconfirmed = unconfirmedBalance ? parseFloat(unconfirmedBalance) : 0;
  const pendingAmount = unconfirmed - confirmed;

  // Calculate UTXO stats
  const utxoSummary = calculateSummary();
  const utxoCount = utxos.length > 0 ? utxos.length : null;
  const utxoTotalValue = utxos.length > 0 ? utxoSummary.totalValue : null;

  // Check sync status
  const isSynced =
    dashboardData?.syncing === false &&
    blockHeight !== null &&
    parseInt(blockHeight, 10) > 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold">Wallet Overview</h3>
          <p className="text-muted-foreground">
            Your complete wallet dashboard at a glance.
          </p>
        </div>

        {/* Balance Card */}
        <BalanceCard
          confirmedBalance={confirmedBalance}
          unconfirmedBalance={unconfirmedBalance}
          mempoolTxCount={dashboardData?.mempool_own_tx_count || 0}
          isLoading={isLoading}
        />

        {/* Quick Stats Grid */}
        <QuickStatsGrid
          utxoCount={utxoCount}
          utxoTotalValue={utxoTotalValue}
          pendingTxCount={dashboardData?.mempool_own_tx_count || 0}
          pendingAmount={pendingAmount}
          mempoolTxCount={mempoolTxCount}
          mempoolSize={mempoolSize}
          isSynced={isSynced}
          peerCount={peerInfo.length}
          blockHeight={blockHeight}
          isLoading={isLoading}
        />

        {/* Recent Activity */}
        <RecentActivity
          transactions={transactionHistory}
          blockHeight={blockHeight}
          confirmations={dashboardData?.confirmations}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        {/* <QuickActions /> */}
      </div>
    </PageContainer>
  );
}

export const Route = createFileRoute('/wallet/')({
  component: WalletOverview,
});
