/**
 * Receive Address Card Component
 *
 * Displays the receiving address with copy functionality and innovative "show all" section
 */

import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceiveAddressCardProps {
  address: string | null;
  isLoading: boolean;
}

export function ReceiveAddressCard({
  address,
  isLoading,
}: ReceiveAddressCardProps) {
  const [copied, setCopied] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const handleCopy = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Truncate address for display: show first 20 and last 20 characters
  const truncateAddress = (addr: string) => {
    if (addr.length <= 50) return addr;
    return `${addr.substring(0, 20)}...${addr.substring(addr.length - 20)}`;
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
            <Skeleton className="h-20 w-full" />
          </div>
        ) : address ? (
          <>
            {/* Main Address Display with Fade Effect */}
            <div className="relative">
              <div className="p-4 bg-primary/2 rounded-lg border">
                <p className="font-mono text-sm break-all text-center leading-relaxed">
                  {showFullAddress ? address : truncateAddress(address)}
                </p>
              </div>

              {/* Fade Effect - Only show when truncated */}
              {!showFullAddress && address.length > 50 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent rounded-b-lg pointer-events-none" />
              )}
            </div>

            {/* Show All / Show Less Button */}
            {address.length > 50 && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFullAddress ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Show All
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Copy Button */}
            <Button variant="secondary" onClick={handleCopy} className="w-full">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </>
              )}
            </Button>

            {/* Quick Copy with Icon Button */}
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                <p className="font-mono text-xs text-muted-foreground text-center">
                  {truncateAddress(address)}
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
