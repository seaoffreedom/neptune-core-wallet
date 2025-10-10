/**
 * Transaction Empty State Component
 *
 * Displays when there are no transactions in the history
 */

import { History } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function TransactionEmpty() {
    return (
        <Empty className="border-2 border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <History />
                </EmptyMedia>
                <EmptyTitle>No Transaction History</EmptyTitle>
                <EmptyDescription>
                    You haven't made any transactions yet. Start by sending or
                    receiving Neptune tokens.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/wallet/send">Send Funds</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/wallet/receive">Receive Funds</Link>
                    </Button>
                </div>
            </EmptyContent>
        </Empty>
    );
}
