import { Cpu, HardDrive, Clock, Thermometer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSystemStore } from '@/store/system.store';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemStats {
  cpu: number;
  memory: number;
  cpuTemp: number | null;
  timestamp: number;
}

export function FooterRight() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    uptime,
    updateUptime,
    setSystemStats: setStoreSystemStats,
  } = useSystemStore();

  // Fetch system resource stats
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const [systemResult, cpuTempResult] = await Promise.all([
          window.electronAPI.system.getResourceStats(),
          window.electronAPI.blockchain.getCpuTemp(),
        ]);

        if (systemResult.success && systemResult.stats) {
          const stats = {
            cpu: systemResult.stats.cpu,
            memory: systemResult.stats.memory,
            cpuTemp: cpuTempResult.success
              ? (cpuTempResult.temp ?? null)
              : null,
            timestamp: systemResult.stats.timestamp,
          };
          setSystemStats(stats);
          setStoreSystemStats(stats);
        }
        setIsLoading(false);
      } catch (error) {
        // Silently handle errors - we'll show "--" for failed stats
        console.warn('Failed to fetch system stats:', error);
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchSystemStats();

    // Then fetch every 5 seconds
    const statsInterval = setInterval(fetchSystemStats, 5000);

    return () => clearInterval(statsInterval);
  }, [setStoreSystemStats]);

  // Update uptime every second
  useEffect(() => {
    // Update immediately
    updateUptime();

    // Then update every second
    const uptimeInterval = setInterval(updateUptime, 1000);

    return () => clearInterval(uptimeInterval);
  }, [updateUptime]);

  const formatMemory = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(0)}MB`;
    }
    const gb = mb / 1024;
    return `${gb.toFixed(1)}GB`;
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Uptime */}
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground text-sm">{uptime}</span>
      </div>

      {/* CPU Usage */}
      <div className="flex items-center space-x-1">
        <Cpu className="h-4 w-4 text-muted-foreground" />
        {isLoading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <span className="text-foreground text-sm">
            {systemStats ? `${systemStats.cpu.toFixed(1)}%` : '--'}
          </span>
        )}
      </div>

      {/* RAM Usage */}
      <div className="flex items-center space-x-1">
        <HardDrive className="h-4 w-4 text-muted-foreground" />
        {isLoading ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <span className="text-foreground text-sm">
            {systemStats ? formatMemory(systemStats.memory) : '--'}
          </span>
        )}
      </div>

      {/* CPU Temperature */}
      <div className="flex items-center space-x-1">
        <Thermometer className="h-4 w-4 text-muted-foreground" />
        {isLoading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <span className="text-foreground text-sm">
            {systemStats && systemStats.cpuTemp !== null
              ? `${systemStats.cpuTemp.toFixed(2)}°C`
              : '--'}
          </span>
        )}
      </div>
    </div>
  );
}
