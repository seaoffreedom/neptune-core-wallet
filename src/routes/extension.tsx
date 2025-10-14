import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Users, Key, Globe, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUIStore } from "@/store/ui.store";

export const Route = createFileRoute("/extension")({
    component: Extension,
});

function Extension() {
    const navigate = useNavigate();
    const experimentalMode = useUIStore((state) => state.experimentalMode);
    const [hasIdentity, setHasIdentity] = useState(false);

    // Redirect to wallet if experimental mode is disabled
    useEffect(() => {
        if (!experimentalMode) {
            navigate({ to: "/wallet" });
        }
    }, [experimentalMode, navigate]);

    // Show warning if experimental mode is disabled
    if (!experimentalMode) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Extension features are only available in
                            experimental mode. Enable experimental mode in the
                            sidebar to access this feature.
                        </AlertDescription>
                    </Alert>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Neptune Accomplice
                            </h1>
                            <p className="text-muted-foreground">
                                Wallet Identity Management for Web3 Integration
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Experimental
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            v1.0.0
                        </Badge>
                    </div>
                </div>

                {/* Identity Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Wallet Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!hasIdentity ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
                                    <Key className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        No Identity Created
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create a wallet identity to enable Web3
                                        authentication and secure messaging.
                                    </p>
                                    <Button
                                        onClick={() => setHasIdentity(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Identity
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">
                                                Neptune User
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Wallet Identity
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="default">Active</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Public Key
                                        </h4>
                                        <div className="p-2 bg-muted/50 rounded-md font-mono text-xs break-all">
                                            npub1...xyz
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Neptune Address
                                        </h4>
                                        <div className="p-2 bg-muted/50 rounded-md font-mono text-xs break-all">
                                            neptune1q...xyz
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Globe className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Key className="h-4 w-4 mr-2" />
                                        Regenerate Keys
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Identity Features */}
                {hasIdentity && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Identity Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg space-y-2">
                                    <h4 className="font-medium">
                                        Web3 Authentication
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sign in to websites using your Neptune
                                        wallet identity
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        Ready
                                    </Badge>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <h4 className="font-medium">
                                        Secure Messaging
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Send encrypted messages to other Neptune
                                        users
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        Ready
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageContainer>
    );
}
