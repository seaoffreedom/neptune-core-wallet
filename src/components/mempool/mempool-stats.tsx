import { Activity, Database, HardDrive, Timer, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MempoolStatsProps {
  totalTransactions: number;
  totalSize: number;
  ownTransactions: number;
  lastUpdated: string | null;
  maxMempoolSize?: number;
}

export function MempoolStats({
  totalTransactions,
  totalSize,
  ownTransactions,
  lastUpdated,
  maxMempoolSize = 1000000, // 1MB default max
}: MempoolStatsProps) {
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

  const mempoolUsagePercent = Math.min((totalSize / maxMempoolSize) * 100, 100);
  const isHighUsage = mempoolUsagePercent > 80;
  const isMediumUsage = mempoolUsagePercent > 50;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Total Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalTransactions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Pending in mempool</p>
          {totalTransactions > 0 && (
            <Badge variant="outline" className="mt-2 text-xs">
              Active
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Mempool Size */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Mempool Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
          <p className="text-xs text-muted-foreground">Memory usage</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Usage</span>
              <span>{mempoolUsagePercent.toFixed(1)}%</span>
            </div>
            <Progress
              value={mempoolUsagePercent}
              className={`h-2 ${
                isHighUsage
                  ? 'bg-red-500'
                  : isMediumUsage
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Your Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Your Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ownTransactions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">From this wallet</p>
          {ownTransactions > 0 && (
            <Badge variant="default" className="mt-2 text-xs bg-blue-500">
              <Zap className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Last Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {lastUpdated ? formatTimeAgo(lastUpdated) : '--'}
          </div>
          <p className="text-xs text-muted-foreground">Data freshness</p>
          {lastUpdated && (
            <Badge variant="secondary" className="mt-2 text-xs">
              <Database className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Mempool Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Mempool Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {totalTransactions === 0 ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Healthy</span>
              </>
            ) : isHighUsage ? (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">High Usage</span>
              </>
            ) : isMediumUsage ? (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Medium Usage</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Normal</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalTransactions === 0
              ? 'No pending transactions'
              : `${totalTransactions} transaction${totalTransactions !== 1 ? 's' : ''} pending`}
          </p>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">Connected</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Mempool synced with network
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
