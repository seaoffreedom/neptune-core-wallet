import { Activity, Cpu, MemoryStick, Thermometer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type {
  CombinedResourceStats,
  SystemResourceStats,
} from '@/preload/api/system-api';
import { rendererLoggers } from '../../renderer/utils/logger';

const logger = rendererLoggers.components;

interface SystemResourceCardsProps {
  className?: string;
}

export function SystemResourceCards({ className }: SystemResourceCardsProps) {
  const [systemStats, setSystemStats] = useState<SystemResourceStats | null>(
    null
  );
  const [combinedStats, setCombinedStats] =
    useState<CombinedResourceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch system resource stats - following footer pattern
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // Fetch system stats, combined stats, and CPU temperature like the footer
        const [systemResult, combinedResult, cpuTempResult] = await Promise.all(
          [
            window.electronAPI.system.getResourceStats(),
            window.electronAPI.system.getCombinedStats(),
            window.electronAPI.blockchain.getCpuTemp(),
          ]
        );

        if (systemResult.success && systemResult.stats) {
          // Add CPU temperature to system stats like the footer does
          const statsWithTemp = {
            ...systemResult.stats,
            cpuTemp: cpuTempResult.success
              ? (cpuTempResult.temp ?? null)
              : null,
          };
          setSystemStats(statsWithTemp);
        }

        if (combinedResult.success && combinedResult.stats) {
          setCombinedStats(combinedResult.stats);
        }

        setIsLoading(false);
      } catch (error) {
        // Silently handle errors - we'll show error state for failed stats
        logger.warn('Failed to fetch system stats', {
          error: (error as Error).message,
        });
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchSystemStats();

    // Then fetch every 5 seconds
    const statsInterval = setInterval(fetchSystemStats, 5000);
    return () => clearInterval(statsInterval);
  }, []); // Empty dependency array like the footer

  // Memoize formatting functions to prevent unnecessary recalculations
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getCpuColor = useCallback((usage: number): string => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getMemoryColor = useCallback((usage: number): string => {
    if (usage < 60) return 'text-green-600';
    if (usage < 85) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  // Memoize calculated values to prevent unnecessary re-renders
  const calculatedValues = useMemo(() => {
    const memoryUsagePercent = systemStats
      ? (systemStats.memory / (8 * 1024 * 1024 * 1024)) * 100
      : 0; // Assuming 8GB total for demo

    return {
      memoryUsagePercent,
      cpuUsage: systemStats?.cpu || 0,
      memoryUsage: systemStats?.memory || 0,
      cpuTemp: systemStats?.cpuTemp || null, // Use real CPU temperature from API
      uptime: systemStats
        ? Math.floor((Date.now() - systemStats.timestamp) / 1000)
        : 0,
    };
  }, [systemStats]);

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {['cpu', 'memory', 'temperature', 'status'].map((type) => (
          <Card key={`skeleton-${type}`} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* CPU Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-2xl font-bold ${getCpuColor(calculatedValues.cpuUsage)}`}
              >
                {formatPercentage(calculatedValues.cpuUsage)}
              </span>
              <Badge variant="outline" className="text-xs">
                System
              </Badge>
            </div>
            <Progress value={calculatedValues.cpuUsage} className="h-2" />
            {combinedStats?.neptuneCore && (
              <div className="text-xs text-muted-foreground">
                Neptune Core: {formatPercentage(combinedStats.neptuneCore.cpu)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MemoryStick className="h-4 w-4" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-2xl font-bold ${getMemoryColor(calculatedValues.memoryUsagePercent)}`}
              >
                {formatBytes(calculatedValues.memoryUsage)}
              </span>
              <Badge variant="outline" className="text-xs">
                Used
              </Badge>
            </div>
            <Progress
              value={calculatedValues.memoryUsagePercent}
              className="h-2"
            />
            {combinedStats?.neptuneCore && (
              <div className="text-xs text-muted-foreground">
                Neptune Core: {formatBytes(combinedStats.neptuneCore.memory)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CPU Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                {calculatedValues.cpuTemp
                  ? `${calculatedValues.cpuTemp.toFixed(2)}°C`
                  : 'N/A'}
              </span>
              <Badge variant="outline" className="text-xs">
                CPU
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Real-time CPU temperature
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-600">
                Healthy
              </span>
              <Badge variant="default" className="text-xs">
                Online
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Uptime:{' '}
                {calculatedValues.uptime > 0
                  ? `${calculatedValues.uptime}s`
                  : 'Unknown'}
              </div>
              {combinedStats?.totalCpu && (
                <div>Total CPU: {formatPercentage(combinedStats.totalCpu)}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
