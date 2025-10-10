/**
 * Receive Address Card Component
 *
 * Displays the receiving address with copy functionality
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReceiveAddressCardProps {
    address: string | null;
    isLoading: boolean;
}

export function ReceiveAddressCard({
    address,
    isLoading,
}: ReceiveAddressCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!address) return;

        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy address:", error);
        }
    };

    // Truncate address for display: show first 16 and last 16 characters
    const truncateAddress = (addr: string) => {
        if (addr.length <= 40) return addr;
        return `${addr.substring(0, 16)}...${addr.substring(addr.length - 16)}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Receiving Address</CardTitle>
                <CardDescription>
                    Share this address to receive Neptune tokens
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : address ? (
                    <>
                        {/* Truncated Address Display */}
                        <div className="p-4 bg-primary/2 rounded-lg">
                            <p className="font-mono text-sm break-all text-center">
                                {truncateAddress(address)}
                            </p>
                        </div>

                        {/* Full Address with Copy Button */}
                        <div className="flex gap-2">
                            <div className="flex-1 p-3 bg-primary/2 rounded-lg overflow-hidden">
                                <p className="font-mono text-xs break-all">
                                    {address}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Copy Button - Full Width Alternative */}
                        <Button
                            variant="secondary"
                            onClick={handleCopy}
                            className="w-full"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Address
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Unable to load receiving address</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
