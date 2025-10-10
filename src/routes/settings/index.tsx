import { createFileRoute, Link } from "@tanstack/react-router";
import {
    Database,
    Gauge,
    Network,
    Pickaxe,
    Settings2,
    Shield,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/settings/")({
    component: SettingsOverview,
});

function SettingsOverview() {
    const settingsCategories = [
        {
            icon: Network,
            title: "Network",
            description:
                "Configure peer connections, ports, and network settings",
            href: "/settings/network",
        },
        {
            icon: Pickaxe,
            title: "Mining",
            description:
                "Proof upgrading, block composition, and guessing configuration",
            href: "/settings/mining",
        },
        {
            icon: Gauge,
            title: "Performance",
            description:
                "Proof generation limits, sync threshold, and memory settings",
            href: "/settings/performance",
        },
        {
            icon: Shield,
            title: "Security",
            description:
                "Privacy controls, access management, and wallet recovery",
            href: "/settings/security",
        },
        {
            icon: Database,
            title: "Data & Storage",
            description:
                "Data directories, block imports, and validation settings",
            href: "/settings/data",
        },
        {
            icon: Settings2,
            title: "Advanced",
            description:
                "Development tools, debugging, and system notifications",
            href: "/settings/advanced",
        },
    ];

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Configure Neptune Core CLI arguments and wallet
                        preferences. Changes require app restart to take effect.
                    </p>
                </div>

                {/* Settings Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settingsCategories.map((category) => (
                        <Link
                            key={category.href}
                            // @ts-expect-error - Route types will be regenerated
                            to={category.href}
                            className="group"
                        >
                            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <category.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <CardTitle className="text-lg">
                                                {category.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {category.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Info Section */}
                <Card className="bg-primary/2">
                    <CardHeader>
                        <CardTitle className="text-base">
                            About Settings
                        </CardTitle>
                        <CardDescription className="space-y-2 text-sm">
                            <p>
                                These settings control neptune-core and
                                neptune-cli command-line arguments. All settings
                                are encrypted and stored locally.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Storage location:{" "}
                                <code className="px-1 py-0.5 rounded bg-background">
                                    ~/.config/neptune-core-wallet/
                                </code>
                            </p>
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </PageContainer>
    );
}
