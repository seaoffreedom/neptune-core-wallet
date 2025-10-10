/**
 * Extension Sidebar Content
 *
 * Displays Neptune Accomplice browser extension settings and configuration
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Shield,
    Globe,
    Key,
    CheckCircle,
    XCircle,
    Link,
    AlertTriangle,
} from "lucide-react";

export function ExtensionSidebar() {
    // Mock data - will be replaced with real state later
    const isExtensionConnected = false;
    const allowedHostsCount = 0;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">Neptune Accomplice</h2>
                <p className="text-sm text-muted-foreground">
                    Browser extension integration
                </p>
            </div>

            <Separator />

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {/* Connection Status */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Connection Status
                            </h3>
                            <div className="p-3 rounded-lg border bg-card">
                                <div className="flex items-center gap-2">
                                    {isExtensionConnected ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">
                                                Connected
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm font-medium">
                                                Not Connected
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isExtensionConnected
                                        ? "Extension is connected and ready"
                                        : "Install Neptune Accomplice to connect"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Settings Sections */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Security
                            </h3>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Allowed Hosts
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {allowedHostsCount} host
                                            {allowedHostsCount !== 1
                                                ? "s"
                                                : ""}{" "}
                                            configured
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    <Key className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            API Permissions
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Manage extension access
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Auto-Approve
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Configure trusted actions
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Connection Settings */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Connection
                            </h3>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    <Link className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Connection Settings
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            WebSocket configuration
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Request Logs
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            View extension requests
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Quick Actions
                            </h3>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                    disabled={!isExtensionConnected}
                                >
                                    Disconnect Extension
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    View Documentation
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
                                >
                                    Revoke All Permissions
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Info */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Extension Info
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <span>
                                        {isExtensionConnected
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Allowed Hosts
                                    </span>
                                    <span>{allowedHostsCount}</span>
                                </div>
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        API Version
                                    </span>
                                    <span className="font-mono">v1.0.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
