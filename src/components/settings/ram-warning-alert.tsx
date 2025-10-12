/**
 * RAM Warning Alert Component
 *
 * Displays a warning alert when the system has insufficient RAM for mining
 */

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RAMWarningData {
  hasSufficientRAM: boolean;
  totalRAM: number;
  minRAMRequired: number;
}

export function RAMWarningAlert() {
  const [ramData, setRamData] = useState<RAMWarningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRAM = async () => {
      try {
        const result =
          await window.electronAPI.system.hasSufficientRAMForMining();
        if (result.success) {
          setRamData({
            hasSufficientRAM: result.hasSufficientRAM ?? false,
            totalRAM: result.totalRAM ?? 0,
            minRAMRequired: result.minRAMRequired ?? 0,
          });
        }
      } catch (error) {
        console.warn('Failed to check RAM for mining:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRAM();
  }, []);

  if (isLoading || !ramData) {
    return null;
  }

  // Only show warning if RAM is insufficient
  if (ramData.hasSufficientRAM) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  return (
    <Alert className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Insufficient RAM for Mining:</strong> Your system has{' '}
        {formatBytes(ramData.totalRAM)} RAM, but Neptune mining requires at
        least {formatBytes(ramData.minRAMRequired)}.
      </AlertDescription>
    </Alert>
  );
}
