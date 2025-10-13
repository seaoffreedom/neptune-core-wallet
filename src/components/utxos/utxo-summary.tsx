/**
 * UTXO Summary Card
 *
 * Displays summary statistics for UTXOs
 */

import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PriceDisplay } from '@/components/ui/price-display';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
export interface UTXOSummary {
  totalCount: number;
  totalValue: number;
  confirmedCount: number;
  confirmedValue: number;
  unconfirmedCount: number;
  unconfirmedValue: number;
  timeLockedCount: number;
  timeLockedValue: number;
  averageSize: number;
}

interface UTXOSummaryProps {
  summary: UTXOSummary;
  isLoading?: boolean;
}

export function UTXOSummaryCard({
  summary,
  isLoading = false,
}: UTXOSummaryProps) {
  const formatBalance = (amount: number): string => {
    return amount.toFixed(2);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const shouldConsolidate = summary.totalCount > 10;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">UTXO Summary</h3>
          {shouldConsolidate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-warning text-sm">
                    <Info className="h-4 w-4" />
                    <span>Consider consolidation</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    You have many small UTXOs. Consolidating them into fewer,
                    larger UTXOs can reduce future transaction fees.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total UTXOs</div>
            <div className="text-2xl font-bold">{summary.totalCount}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {formatBalance(summary.totalValue)} $NPT
            </div>
            <PriceDisplay 
              nptAmount={summary.totalValue} 
              className="text-xs"
            />
          </div>

          {/* Confirmed */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Confirmed</div>
            <div className="text-2xl font-bold text-green-500">
              {summary.confirmedCount}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {formatBalance(summary.confirmedValue)} $NPT
            </div>
            <PriceDisplay 
              nptAmount={summary.confirmedValue} 
              className="text-xs"
            />
          </div>

          {/* Unconfirmed */}
          {summary.unconfirmedCount > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-warning">
                {summary.unconfirmedCount}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatBalance(summary.unconfirmedValue)} $NPT
              </div>
              <PriceDisplay 
                nptAmount={summary.unconfirmedValue} 
                className="text-xs"
              />
            </div>
          )}

          {/* Time-locked */}
          {summary.timeLockedCount > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Time-locked</div>
              <div className="text-2xl font-bold">
                {summary.timeLockedCount}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatBalance(summary.timeLockedValue)} $NPT
              </div>
              <PriceDisplay 
                nptAmount={summary.timeLockedValue} 
                className="text-xs"
              />
            </div>
          )}

          {/* Average Size */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Average Size</div>
            <div className="text-2xl font-bold">
              {formatBalance(summary.averageSize)}
            </div>
            <div className="text-xs text-muted-foreground">$NPT</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
