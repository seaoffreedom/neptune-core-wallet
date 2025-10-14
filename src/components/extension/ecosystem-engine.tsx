import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Settings, Trash2, ExternalLink } from "lucide-react";

export function EcosystemEngine() {
    // Mock data - will be replaced with real state later
    const connectedApps = [
        {
            id: "1",
            name: "Neptune Marketplace",
            description: "NFT and DApp marketplace",
            url: "https://marketplace.neptune.com",
            status: "connected",
            permissions: ["read", "transact"],
            lastUsed: "2 hours ago",
        },
        {
            id: "2",
            name: "Neptune DeFi Hub",
            description: "Decentralized finance platform",
            url: "https://defi.neptune.com",
            status: "connected",
            permissions: ["read", "transact", "sign"],
            lastUsed: "1 day ago",
        },
        {
            id: "3",
            name: "Neptune Social",
            description: "Social platform for Neptune users",
            url: "https://social.neptune.com",
            status: "pending",
            permissions: ["read"],
            lastUsed: "Never",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Connected Apps */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Connected Applications
                            </CardTitle>
                            <CardDescription>
                                Manage your connected Neptune ecosystem
                                applications
                            </CardDescription>
                        </div>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add App
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {connectedApps.map((app) => (
                        <div
                            key={app.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{app.name}</h4>
                                    <Badge
                                        variant={
                                            app.status === "connected"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {app.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {app.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {app.url}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        •
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Last used: {app.lastUsed}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {app.permissions.map((permission) => (
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
                                <Button size="sm" variant="ghost">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* App Discovery */}
            <Card>
                <CardHeader>
                    <CardTitle>Discover Applications</CardTitle>
                    <CardDescription>
                        Explore new Neptune-based applications and services
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg space-y-2">
                            <h4 className="font-medium">Featured Apps</h4>
                            <p className="text-sm text-muted-foreground">
                                Curated selection of top Neptune applications
                            </p>
                            <Button size="sm" variant="outline">
                                Browse Featured
                            </Button>
                        </div>
                        <div className="p-4 border rounded-lg space-y-2">
                            <h4 className="font-medium">Developer Tools</h4>
                            <p className="text-sm text-muted-foreground">
                                Tools and utilities for Neptune developers
                            </p>
                            <Button size="sm" variant="outline">
                                Explore Tools
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ecosystem Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Ecosystem Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-xs text-muted-foreground">
                                Connected Apps
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs text-muted-foreground">
                                Available Apps
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-xs text-muted-foreground">
                                Transactions
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
