import { Clock, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MempoolEmpty() {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Database className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    No Pending Transactions
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                    The mempool is currently empty. New transactions will appear
                    here as they are broadcast to the network.
                </p>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Waiting for transactions...</span>
                </div>
            </CardContent>
        </Card>
    );
}
