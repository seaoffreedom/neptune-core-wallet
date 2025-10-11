import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { BalanceCard, QuickActions, RecentActivity } from "@/components/wallet";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton-enhanced";
import { useOnchainStore } from "@/store/onchain.store";

function WalletOverview() {
    // Get data from Zustand store
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);
    const unconfirmedBalance = useOnchainStore(
        (state) => state.unconfirmedBalance,
    );
    const blockHeight = useOnchainStore((state) => state.blockHeight);
    const transactionHistory = useOnchainStore(
        (state) => state.transactionHistory,
    );

    const isLoading = !dashboardData;

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

                {isLoading ? (
                    // Loading skeletons that match the actual content structure
                    <>
                        {/* Balance Card Skeleton */}
                        <CardSkeleton />

                        {/* Recent Activity Skeleton */}
                        <div className="rounded-md border p-6">
                            <div className="space-y-4">
                                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <TableSkeleton rows={5} columns={4} />
                            </div>
                        </div>
                    </>
                ) : (
                    // Actual content
                    <>
                        {/* Balance Card */}
                        <BalanceCard
                            confirmedBalance={confirmedBalance}
                            unconfirmedBalance={unconfirmedBalance}
                            mempoolTxCount={
                                dashboardData?.mempool_own_tx_count || 0
                            }
                            dashboardData={dashboardData}
                            isLoading={false}
                        />

                        {/* Recent Activity */}
                        <RecentActivity
                            transactions={transactionHistory}
                            blockHeight={blockHeight}
                            confirmations={dashboardData?.confirmations}
                            isLoading={false}
                        />
                    </>
                )}

                {/* Quick Actions */}
                {/* <QuickActions /> */}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/")({
    component: WalletOverview,
});
