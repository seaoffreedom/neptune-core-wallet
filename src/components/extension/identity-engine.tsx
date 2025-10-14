import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Key, Globe } from "lucide-react";

export function IdentityEngine() {
    // Mock data - will be replaced with real state later
    const identity = {
        name: "Neptune User",
        publicKey: "np1...abc123",
        neptuneAddress: "np1...xyz789",
        bio: "Neptune ecosystem enthusiast",
        socialLinks: {
            twitter: "@neptuneuser",
            github: "neptuneuser",
        },
        preferences: {
            allowMessages: true,
            showOnlineStatus: true,
            allowAppConnections: true,
        },
    };

    return (
        <div className="space-y-6">
            {/* Profile Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Identity Profile
                    </CardTitle>
                    <CardDescription>
                        Manage your Neptune identity for Web3 authentication and
                        social features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src="/placeholder-avatar.png" />
                            <AvatarFallback>NU</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                                {identity.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {identity.bio}
                            </p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    <Key className="h-3 w-3 mr-1" />
                                    {identity.publicKey}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {identity.neptuneAddress}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm">Edit Profile</Button>
                        <Button size="sm" variant="outline">
                            Export Identity
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>
                        Connect your social profiles
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Twitter</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {identity.socialLinks.twitter}
                            </span>
                            <Button size="sm" variant="ghost">
                                Edit
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">GitHub</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {identity.socialLinks.github}
                            </span>
                            <Button size="sm" variant="ghost">
                                Edit
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                        Control what information is shared
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">
                                Allow Messages
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Let other users send you messages
                            </div>
                        </div>
                        <Badge
                            variant={
                                identity.preferences.allowMessages
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {identity.preferences.allowMessages
                                ? "Enabled"
                                : "Disabled"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">
                                Show Online Status
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Display when you're active
                            </div>
                        </div>
                        <Badge
                            variant={
                                identity.preferences.showOnlineStatus
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {identity.preferences.showOnlineStatus
                                ? "Enabled"
                                : "Disabled"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">
                                Allow App Connections
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Let DApps connect to your wallet
                            </div>
                        </div>
                        <Badge
                            variant={
                                identity.preferences.allowAppConnections
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {identity.preferences.allowAppConnections
                                ? "Enabled"
                                : "Disabled"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
