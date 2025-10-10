/**
 * useElectronAPI Hook
 *
 * Custom React hook for accessing Electron APIs in the renderer process.
 */

import { useCallback } from "react";

/**
 * Hook to access Electron API
 */
export function useElectronAPI() {
    const electronAPI = window.electronAPI;

    if (!electronAPI) {
        throw new Error(
            "Electron API not available. Make sure the app is running in Electron.",
        );
    }

    return electronAPI;
}

/**
 * Hook for app lifecycle operations
 */
export function useAppAPI() {
    const electronAPI = useElectronAPI();

    return {
        quit: useCallback(
            (force?: boolean) => electronAPI.quit(force),
            [electronAPI],
        ),
        restart: useCallback(() => electronAPI.restart(), [electronAPI]),
        getVersion: useCallback(() => electronAPI.getVersion(), [electronAPI]),
    };
}

/**
 * Hook for window operations
 */
export function useWindowAPI() {
    const electronAPI = useElectronAPI();

    return {
        minimize: useCallback(() => electronAPI.minimize(), [electronAPI]),
        maximize: useCallback(() => electronAPI.maximize(), [electronAPI]),
        close: useCallback(() => electronAPI.close(), [electronAPI]),
        isMaximized: useCallback(
            () => electronAPI.isMaximized(),
            [electronAPI],
        ),
        setTitle: useCallback(
            (title: string) => electronAPI.setTitle(title),
            [electronAPI],
        ),
    };
}

/**
 * Hook for file operations
 */
export function useFileAPI() {
    const electronAPI = useElectronAPI();

    return {
        openDialog: useCallback(
            (options?: Parameters<typeof electronAPI.openDialog>[0]) =>
                electronAPI.openDialog(options),
            [electronAPI],
        ),
        saveDialog: useCallback(
            (options?: Parameters<typeof electronAPI.saveDialog>[0]) =>
                electronAPI.saveDialog(options),
            [electronAPI],
        ),
        readFile: useCallback(
            (path: string, encoding?: BufferEncoding) =>
                electronAPI.readFile(path, encoding),
            [electronAPI],
        ),
        writeFile: useCallback(
            (path: string, data: string, encoding?: BufferEncoding) =>
                electronAPI.writeFile(path, data, encoding),
            [electronAPI],
        ),
        fileExists: useCallback(
            (path: string) => electronAPI.fileExists(path),
            [electronAPI],
        ),
        deleteFile: useCallback(
            (path: string) => electronAPI.deleteFile(path),
            [electronAPI],
        ),
    };
}

/**
 * Hook for settings operations
 */
export function useSettingsAPI() {
    const electronAPI = useElectronAPI();

    return {
        getSetting: useCallback(
            <T = unknown>(key: string) => electronAPI.getSetting<T>(key),
            [electronAPI],
        ),
        setSetting: useCallback(
            <T = unknown>(key: string, value: T) =>
                electronAPI.setSetting<T>(key, value),
            [electronAPI],
        ),
        resetSetting: useCallback(
            (key?: string) => electronAPI.resetSetting(key),
            [electronAPI],
        ),
        exportSettings: useCallback(
            (path?: string) => electronAPI.exportSettings(path),
            [electronAPI],
        ),
        importSettings: useCallback(
            (path: string) => electronAPI.importSettings(path),
            [electronAPI],
        ),
    };
}

/**
 * Hook for process operations
 */
export function useProcessAPI() {
    const electronAPI = useElectronAPI();

    return {
        spawnProcess: useCallback(
            (
                command: string,
                args?: string[],
                options?: Parameters<typeof electronAPI.spawnProcess>[2],
            ) => electronAPI.spawnProcess(command, args, options),
            [electronAPI],
        ),
        killProcess: useCallback(
            (pid: number, signal?: string) =>
                electronAPI.killProcess(pid, signal),
            [electronAPI],
        ),
        getProcessStatus: useCallback(
            (pid: number) => electronAPI.getProcessStatus(pid),
            [electronAPI],
        ),
    };
}

/**
 * Hook for wallet operations
 */
export function useWalletAPI() {
    const electronAPI = useElectronAPI();

    return {
        createWallet: useCallback(
            (name: string, password?: string, path?: string) =>
                electronAPI.createWallet(name, password, path),
            [electronAPI],
        ),
        loadWallet: useCallback(
            (path: string, password?: string) =>
                electronAPI.loadWallet(path, password),
            [electronAPI],
        ),
        saveWallet: useCallback(
            (walletId: string, path: string, password?: string) =>
                electronAPI.saveWallet(walletId, path, password),
            [electronAPI],
        ),
        encryptWallet: useCallback(
            (walletId: string, password: string) =>
                electronAPI.encryptWallet(walletId, password),
            [electronAPI],
        ),
        decryptWallet: useCallback(
            (walletId: string, password: string) =>
                electronAPI.decryptWallet(walletId, password),
            [electronAPI],
        ),
    };
}
