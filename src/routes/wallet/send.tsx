import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { SendFormEnhanced } from "@/components/send";

function SendFunds() {
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

                <SendFormEnhanced />
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/send")({
    component: SendFunds,
});
