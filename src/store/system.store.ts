/**
 * System Store
 *
 * Manages system-wide data like uptime, system stats, etc.
 */

import { create } from "zustand";

export interface SystemState {
    // Uptime tracking
    startTime: number;
    uptime: string;

    // System stats
    systemStats: {
        cpu: number;
        memory: number;
        cpuTemp: number | null;
        timestamp: number;
    } | null;

    // Actions
    setStartTime: (time: number) => void;
    updateUptime: () => void;
    setSystemStats: (
        stats: {
            cpu: number;
            memory: number;
            cpuTemp: number | null;
            timestamp: number;
        } | null,
    ) => void;
}

export const useSystemStore = create<SystemState>((set, get) => ({
    // Initial state
    startTime: Date.now(),
    uptime: "0s",
    systemStats: null,

    // Actions
    setStartTime: (time: number) => {
        set({ startTime: time });
        get().updateUptime();
    },

    updateUptime: () => {
        const { startTime } = get();
        const now = Date.now();
        const elapsed = now - startTime;

        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let uptimeString = "";

        if (days > 0) {
            uptimeString += `${days}d `;
        }
        if (hours % 24 > 0) {
            uptimeString += `${hours % 24}h `;
        }
        if (minutes % 60 > 0) {
            uptimeString += `${minutes % 60}m `;
        }
        uptimeString += `${seconds % 60}s`;

        set({ uptime: uptimeString.trim() });
    },

    setSystemStats: (stats) => {
        set({ systemStats: stats });
    },
}));
