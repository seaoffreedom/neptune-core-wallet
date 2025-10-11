import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ReceiveAddressCard } from "@/components/receive";
import { CardSkeleton } from "@/components/ui/skeleton-enhanced";
import { useNthReceivingAddress } from "@/renderer/hooks/use-onchain-data";

function ReceiveFunds() {
    // Get the first receiving address (index 0)
    const { address, isLoading, fetchAddress } = useNthReceivingAddress(0);

    // Fetch address on mount
    useEffect(() => {
        fetchAddress();
    }, [fetchAddress]);

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold">Receive Funds</h3>
                    <p className="text-muted-foreground">
                        Generate a receiving address for Neptune tokens.
                    </p>
                </div>

                {isLoading ? (
                    <CardSkeleton />
                ) : (
                    <ReceiveAddressCard address={address} isLoading={false} />
                )}

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">
                            How to receive Neptune tokens
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                            <li>
                                Share your receiving address with the sender
                            </li>
                            <li>
                                Wait for the transaction to be broadcast to the
                                network
                            </li>
                            <li>
                                Funds will appear in your wallet once confirmed
                            </li>
                            <li>
                                Check transaction history for confirmation
                                status
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            <strong>Note:</strong> This is a privacy-preserving
                            address. Neptune uses advanced cryptography to
                            protect your transaction privacy.
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/receive")({
    component: ReceiveFunds,
});
