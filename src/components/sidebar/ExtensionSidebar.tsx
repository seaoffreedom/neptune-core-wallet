/**
 * Extension Sidebar Content
 *
 * Displays Neptune Accomplice browser extension settings and configuration
 * with engine-based organization
 */

import {
    AlertTriangle,
    CheckCircle,
    Globe,
    Key,
    Link,
    Shield,
    XCircle,
    Users,
    MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function ExtensionSidebar() {
    // Mock data - will be replaced with real state later
    const isExtensionConnected = true;
    const allowedHostsCount = 2;
    const connectedAppsCount = 3;
    const activeSessionsCount = 2;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">Neptune Accomplice</h2>
                <p className="text-sm text-muted-foreground">
                    Identity & Ecosystem Management
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

                        {/* Engine Status */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Engine Status
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 rounded-md bg-card border">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Identity
                                        </span>
                                    </div>
                                    <Badge
                                        variant="default"
                                        className="text-xs"
                                    >
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-card border">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Ecosystem
                                        </span>
                                    </div>
                                    <Badge
                                        variant="default"
                                        className="text-xs"
                                    >
                                        {connectedAppsCount} apps
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-card border">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Connection
                                        </span>
                                    </div>
                                    <Badge
                                        variant="default"
                                        className="text-xs"
                                    >
                                        {activeSessionsCount} sessions
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-card border">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Security
                                        </span>
                                    </div>
                                    <Badge
                                        variant="default"
                                        className="text-xs"
                                    >
                                        Secure
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Quick Stats */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Quick Stats
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Connected Apps
                                    </span>
                                    <span>{connectedAppsCount}</span>
                                </div>
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Active Sessions
                                    </span>
                                    <span>{activeSessionsCount}</span>
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
                                >
                                    View All Engines
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    Security Audit
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
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
