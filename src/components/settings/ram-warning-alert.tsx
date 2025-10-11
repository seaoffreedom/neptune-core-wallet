/**
 * RAM Warning Alert Component
 *
 * Displays a warning alert when the system has insufficient RAM for mining
 */

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                console.warn("Failed to check RAM for mining:", error);
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
            <AlertTitle>Insufficient RAM for Mining</AlertTitle>
            <AlertDescription className="mt-2">
                <p>
                    Your system has{" "}
                    <strong>{formatBytes(ramData.totalRAM)}</strong> of RAM, but
                    Neptune mining requires at least{" "}
                    <strong>{formatBytes(ramData.minRAMRequired)}</strong> to
                    operate safely.
                </p>
                <p className="mt-2">
                    Mining with insufficient RAM may cause system crashes, data
                    loss, or poor performance. Consider upgrading your system or
                    disabling mining features.
                </p>
            </AlertDescription>
        </Alert>
    );
}
