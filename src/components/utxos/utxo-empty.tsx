/**
 * UTXO Empty State
 *
 * Displayed when there are no UTXOs
 */

import { Coins } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";

export function UTXOEmpty() {
    return (
        <Empty>
            <EmptyMedia>
                <Coins className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyContent>
                <EmptyTitle>No UTXOs Found</EmptyTitle>
                <EmptyDescription>
                    You don't have any coins in your wallet yet. Receive some
                    Neptune tokens to get started.
                </EmptyDescription>
                <Link to="/wallet/receive">
                    <Button>Receive Funds</Button>
                </Link>
            </EmptyContent>
        </Empty>
    );
}
