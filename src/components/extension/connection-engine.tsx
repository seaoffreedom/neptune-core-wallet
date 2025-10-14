import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Globe,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react";

export function ConnectionEngine() {
    // Mock data - will be replaced with real state later
    const activeSessions = [
        {
            id: "1",
            origin: "https://marketplace.neptune.com",
            appName: "Neptune Marketplace",
            status: "active",
            connectedAt: "2 hours ago",
            lastActivity: "5 minutes ago",
            permissions: ["read", "transact"],
        },
        {
            id: "2",
            origin: "https://defi.neptune.com",
            appName: "Neptune DeFi Hub",
            status: "active",
            connectedAt: "1 day ago",
            lastActivity: "1 hour ago",
            permissions: ["read", "transact", "sign"],
        },
    ];

    const pendingRequests = [
        {
            id: "3",
            origin: "https://social.neptune.com",
            appName: "Neptune Social",
            requestedAt: "10 minutes ago",
            permissions: ["read", "message"],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Active Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Active Sessions
                    </CardTitle>
                    <CardDescription>
                        Currently connected browser sessions and their
                        permissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium">
                                        {session.appName}
                                    </h4>
                                    <Badge variant="default">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {session.origin}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                        Connected: {session.connectedAt}
                                    </span>
                                    <span>
                                        Last activity: {session.lastActivity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {session.permissions.map((permission) => (
                                        <Badge
                                            key={permission}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {permission}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                    Revoke
                                </Button>
                                <Button size="sm" variant="ghost">
                                    Settings
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Pending Connection Requests
                    </CardTitle>
                    <CardDescription>
                        Applications requesting to connect to your wallet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingRequests.map((request) => (
                        <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium">
                                        {request.appName}
                                    </h4>
                                    <Badge variant="secondary">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {request.origin}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                    Requested: {request.requestedAt}
                                </div>
                                <div className="flex items-center gap-1">
                                    {request.permissions.map((permission) => (
                                        <Badge
                                            key={permission}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {permission}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive"
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Deny
                                </Button>
                                <Button size="sm">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Connection Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Connection Settings</CardTitle>
                    <CardDescription>
                        Configure how applications can connect to your wallet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    Auto-approve trusted apps
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Automatically approve connection requests
                                    from verified applications
                                </div>
                            </div>
                            <Badge variant="secondary">Disabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    Session timeout
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Automatically disconnect inactive sessions
                                </div>
                            </div>
                            <Badge variant="outline">24 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    Request notifications
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Show notifications for new connection
                                    requests
                                </div>
                            </div>
                            <Badge variant="default">Enabled</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
