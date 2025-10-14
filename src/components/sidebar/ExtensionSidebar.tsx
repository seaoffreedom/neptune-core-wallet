/**
 * Extension Sidebar Content
 *
 * Displays Neptune Accomplice identity management and configuration
 */

import { CheckCircle, Key, Users, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function ExtensionSidebar() {
    // Mock data - will be replaced with real state later
    const hasIdentity = true;
    const identityName = "Neptune User";

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">Neptune Accomplice</h2>
                <p className="text-sm text-muted-foreground">
                    Wallet Identity Management
                </p>
            </div>

            <Separator />

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {/* Identity Status */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Identity Status
                            </h3>
                            <div className="p-3 rounded-lg border bg-card">
                                <div className="flex items-center gap-2">
                                    {hasIdentity ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">
                                                Identity Active
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm font-medium">
                                                No Identity
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {hasIdentity
                                        ? `Identity: ${identityName}`
                                        : "Create an identity to get started"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Identity Details */}
                        {hasIdentity && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Identity Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 rounded-md bg-card border">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                Profile
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
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                Keys
                                            </span>
                                        </div>
                                        <Badge
                                            variant="default"
                                            className="text-xs"
                                        >
                                            Generated
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Quick Stats */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Quick Stats
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Identity Status
                                    </span>
                                    <span>
                                        {hasIdentity ? "Active" : "None"}
                                    </span>
                                </div>
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Web3 Auth
                                    </span>
                                    <span>
                                        {hasIdentity ? "Ready" : "Disabled"}
                                    </span>
                                </div>
                                <div className="flex justify-between px-3 py-1">
                                    <span className="text-muted-foreground">
                                        Messaging
                                    </span>
                                    <span>
                                        {hasIdentity ? "Ready" : "Disabled"}
                                    </span>
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
                                {!hasIdentity ? (
                                    <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                    >
                                        Create Identity
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                        >
                                            Regenerate Keys
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                >
                                    View Documentation
                                </button>
                                {hasIdentity && (
                                    <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
                                    >
                                        Delete Identity
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
