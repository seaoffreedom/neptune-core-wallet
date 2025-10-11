import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { SendFormEnhanced } from "@/components/send";
import { FormSkeleton } from "@/components/ui/skeleton-enhanced";
import { useOnchainStore } from "@/store/onchain.store";

function SendFunds() {
    // Check if we have basic wallet data loaded
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const isLoading = !dashboardData;

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold">Send Funds</h3>
                    <p className="text-muted-foreground">
                        Send Neptune tokens to one or multiple recipients with
                        privacy.
                    </p>
                </div>

                {isLoading ? (
                    <div className="rounded-md border bg-card/50 p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <div className="h-4 w-48 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                            </div>
                            <FormSkeleton fields={4} />
                        </div>
                    </div>
                ) : (
                    <SendFormEnhanced />
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/send")({
    component: SendFunds,
});
