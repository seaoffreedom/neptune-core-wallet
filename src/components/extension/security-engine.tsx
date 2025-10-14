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
    Shield,
    Key,
    Globe,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react";

export function SecurityEngine() {
    // Mock data - will be replaced with real state later
    const securityChecks = [
        {
            id: "1",
            name: "Extension Integrity",
            description: "Verify browser extension is not tampered with",
            status: "passed",
            lastChecked: "2 minutes ago",
        },
        {
            id: "2",
            name: "Connection Encryption",
            description: "All connections use secure protocols",
            status: "passed",
            lastChecked: "5 minutes ago",
        },
        {
            id: "3",
            name: "Permission Validation",
            description: "Validate app permissions are appropriate",
            status: "warning",
            lastChecked: "1 hour ago",
        },
        {
            id: "4",
            name: "Neptune Core Security",
            description: "Verify Neptune Core binary integrity",
            status: "passed",
            lastChecked: "10 minutes ago",
        },
    ];

    const allowedHosts = [
        {
            id: "1",
            host: "marketplace.neptune.com",
            permissions: ["read", "transact"],
            addedAt: "2 days ago",
            lastUsed: "2 hours ago",
        },
        {
            id: "2",
            host: "defi.neptune.com",
            permissions: ["read", "transact", "sign"],
            addedAt: "1 week ago",
            lastUsed: "1 hour ago",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Security Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Status
                    </CardTitle>
                    <CardDescription>
                        Current security status and system integrity checks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {securityChecks.map((check) => (
                        <div
                            key={check.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium">
                                        {check.name}
                                    </h4>
                                    <Badge
                                        variant={
                                            check.status === "passed"
                                                ? "default"
                                                : check.status === "warning"
                                                  ? "secondary"
                                                  : "destructive"
                                        }
                                    >
                                        {check.status === "passed" && (
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {check.status === "warning" && (
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                        )}
                                        {check.status === "failed" && (
                                            <XCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {check.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {check.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Last checked: {check.lastChecked}
                                </p>
                            </div>
                            <Button size="sm" variant="outline">
                                Recheck
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Allowed Hosts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Allowed Hosts
                    </CardTitle>
                    <CardDescription>
                        Websites and applications that can connect to your
                        wallet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allowedHosts.map((host) => (
                        <div
                            key={host.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="space-y-1">
                                <h4 className="font-medium">{host.host}</h4>
                                <div className="flex items-center gap-1">
                                    {host.permissions.map((permission) => (
                                        <Badge
                                            key={permission}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {permission}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Added: {host.addedAt}</span>
                                    <span>Last used: {host.lastUsed}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full">
                        <Globe className="h-4 w-4 mr-2" />
                        Add Allowed Host
                    </Button>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                        Configure security preferences and auto-approval rules
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    Auto-approve verified apps
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Automatically approve requests from verified
                                    Neptune applications
                                </div>
                            </div>
                            <Badge variant="secondary">Disabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    Require confirmation for large transactions
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Always require manual confirmation for
                                    transactions above threshold
                                </div>
                            </div>
                            <Badge variant="default">Enabled</Badge>
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
                    </div>
                </CardContent>
            </Card>

            {/* Security Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Security Actions</CardTitle>
                    <CardDescription>
                        Manage security settings and perform security operations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate API Keys
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Run Security Audit
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-destructive"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke All Permissions
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
