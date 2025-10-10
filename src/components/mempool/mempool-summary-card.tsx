import { Activity, Database, HardDrive, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MempoolSummary {
  totalTransactions: number;
  totalSize: number;
  ownTransactions: number;
  lastUpdated: string | null;
}

interface MempoolSummaryCardProps {
  summary: MempoolSummary;
}

export function MempoolSummaryCard({ summary }: MempoolSummaryCardProps) {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Mempool Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Transactions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Total Transactions</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.totalTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Pending in mempool
            </div>
          </div>

          {/* Total Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Total Size</span>
            </div>
            <div className="text-2xl font-bold">
              {formatSize(summary.totalSize)}
            </div>
            <div className="text-xs text-muted-foreground">Memory usage</div>
          </div>

          {/* Own Transactions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Your Transactions</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.ownTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              From this wallet
            </div>
          </div>

          {/* Last Updated */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Last Updated</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.lastUpdated ? formatTimeAgo(summary.lastUpdated) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Data freshness</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
