/**
 * IPC Channel Type Definitions
 *
 * TypeScript interfaces for all IPC communication between main and renderer processes.
 * Ensures type safety for all IPC operations.
 */

import type { IpcChannel } from "../constants/ipc-channels";

// Base IPC message structure
export interface IpcMessage<T = any> {
    channel: IpcChannel;
    data: T;
}

// App lifecycle types
export interface AppQuitRequest {
    force?: boolean;
}

export interface AppVersionResponse {
    version: string;
    electronVersion: string;
    nodeVersion: string;
}

// Window management types
export interface WindowTitleRequest {
    title: string;
}

export interface WindowMaximizedResponse {
    isMaximized: boolean;
}

// File operation types
export interface FileDialogRequest {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
    properties?: Array<
        "openFile" | "openDirectory" | "multiSelections" | "showHiddenFiles"
    >;
}

export interface FileDialogResponse {
    canceled: boolean;
    filePaths: string[];
}

export interface FileReadRequest {
    path: string;
    encoding?: BufferEncoding;
}

export interface FileReadResponse {
    success: boolean;
    data?: string;
    error?: string;
}

export interface FileWriteRequest {
    path: string;
    data: string;
    encoding?: BufferEncoding;
}

export interface FileWriteResponse {
    success: boolean;
    error?: string;
}

export interface FileExistsRequest {
    path: string;
}

export interface FileExistsResponse {
    exists: boolean;
}

export interface FileDeleteRequest {
    path: string;
}

export interface FileDeleteResponse {
    success: boolean;
    error?: string;
}

// Settings management types
export interface SettingsGetRequest {
    key: string;
}

export interface SettingsGetResponse<T = any> {
    success: boolean;
    value?: T;
    error?: string;
}

export interface SettingsSetRequest<T = any> {
    key: string;
    value: T;
}

export interface SettingsSetResponse {
    success: boolean;
    error?: string;
}

export interface SettingsResetRequest {
    key?: string; // If not provided, resets all settings
}

export interface SettingsResetResponse {
    success: boolean;
    error?: string;
}

export interface SettingsExportRequest {
    path?: string; // If not provided, uses default location
}

export interface SettingsExportResponse {
    success: boolean;
    path?: string;
    error?: string;
}

export interface SettingsImportRequest {
    path: string;
}

export interface SettingsImportResponse {
    success: boolean;
    error?: string;
}

// Process management types
export interface ProcessSpawnRequest {
    command: string;
    args?: string[];
    options?: {
        cwd?: string;
        env?: Record<string, string>;
        shell?: boolean;
    };
}

export interface ProcessSpawnResponse {
    success: boolean;
    pid?: number;
    error?: string;
}

export interface ProcessKillRequest {
    pid: number;
    signal?: string;
}

export interface ProcessKillResponse {
    success: boolean;
    error?: string;
}

export interface ProcessStatusRequest {
    pid: number;
}

export interface ProcessStatusResponse {
    success: boolean;
    running?: boolean;
    error?: string;
}

// Wallet operation types
export interface WalletCreateRequest {
    name: string;
    password?: string;
    path?: string;
}

export interface WalletCreateResponse {
    success: boolean;
    walletId?: string;
    error?: string;
}

export interface WalletLoadRequest {
    path: string;
    password?: string;
}

export interface WalletLoadResponse {
    success: boolean;
    wallet?: {
        id: string;
        name: string;
        addresses: string[];
    };
    error?: string;
}

export interface WalletSaveRequest {
    walletId: string;
    path: string;
    password?: string;
}

export interface WalletSaveResponse {
    success: boolean;
    error?: string;
}

export interface WalletEncryptRequest {
    walletId: string;
    password: string;
}

export interface WalletEncryptResponse {
    success: boolean;
    error?: string;
}

export interface WalletDecryptRequest {
    walletId: string;
    password: string;
}

export interface WalletDecryptResponse {
    success: boolean;
    error?: string;
}

// System integration types
export interface NotificationRequest {
    title: string;
    body?: string;
    icon?: string;
    silent?: boolean;
}

export interface NotificationResponse {
    success: boolean;
    error?: string;
}

export interface PlatformResponse {
    platform: string;
    arch: string;
}

export interface SystemPathRequest {
    name:
        | "home"
        | "appData"
        | "userData"
        | "temp"
        | "exe"
        | "module"
        | "desktop"
        | "documents"
        | "downloads"
        | "music"
        | "pictures"
        | "videos";
}

export interface SystemPathResponse {
    success: boolean;
    path?: string;
    error?: string;
}
