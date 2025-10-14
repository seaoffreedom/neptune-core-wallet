import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
    AlertTriangle,
    Users,
    Globe,
    Shield,
    MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui.store";
import { IdentityEngine } from "@/components/extension/identity-engine";
import { EcosystemEngine } from "@/components/extension/ecosystem-engine";
import { ConnectionEngine } from "@/components/extension/connection-engine";
import { SecurityEngine } from "@/components/extension/security-engine";

export const Route = createFileRoute("/extension")({
    component: Extension,
});

function Extension() {
    const navigate = useNavigate();
    const experimentalMode = useUIStore((state) => state.experimentalMode);
    const [activeTab, setActiveTab] = useState("identity");

    // Redirect to wallet if experimental mode is disabled
    useEffect(() => {
        if (!experimentalMode) {
            navigate({ to: "/wallet" });
        }
    }, [experimentalMode, navigate]);

    // Show warning if experimental mode is disabled
    if (!experimentalMode) {
        return (
            <div className="p-8 space-y-4">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Extension features are only available in experimental
                        mode. Enable experimental mode in the sidebar to access
                        this feature.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Neptune Accomplice
                        </h1>
                        <p className="text-muted-foreground">
                            Identity & Ecosystem Management for Web3 Integration
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Experimental
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        v1.0.0
                    </Badge>
                </div>
            </div>

            {/* Engine Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Identity Engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">
                            Profile configured
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Ecosystem Engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Connected apps
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Connection Engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">
                            Active sessions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security Engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Secure</div>
                        <p className="text-xs text-muted-foreground">
                            All checks passed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Engine Management Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                        value="identity"
                        className="flex items-center gap-2"
                    >
                        <Users className="h-4 w-4" />
                        Identity
                    </TabsTrigger>
                    <TabsTrigger
                        value="ecosystem"
                        className="flex items-center gap-2"
                    >
                        <Globe className="h-4 w-4" />
                        Ecosystem
                    </TabsTrigger>
                    <TabsTrigger
                        value="connection"
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Connection
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="flex items-center gap-2"
                    >
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-4">
                    <IdentityEngine />
                </TabsContent>

                <TabsContent value="ecosystem" className="space-y-4">
                    <EcosystemEngine />
                </TabsContent>

                <TabsContent value="connection" className="space-y-4">
                    <ConnectionEngine />
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <SecurityEngine />
                </TabsContent>
            </Tabs>
        </div>
    );
}
