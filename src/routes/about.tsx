import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";

export const Route = createFileRoute("/about")({
    component: About,
});

function About() {
    return (
        <PageContainer>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">
                    About Neptune Core Wallet
                </h1>
                <p className="text-muted-foreground">
                    A privacy-preserving, quantum-resistant, zk-STARKs-based L1
                    blockchain wallet.
                </p>
            </div>
        </PageContainer>
    );
}
