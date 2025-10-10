/**
 * Splash Screen Component
 *
 * Shows during app startup while Neptune processes are initializing.
 * This screen appears before the main app UI loads.
 */

import { CheckCircle, Loader2, Settings, Wallet, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNeptuneAPI } from "@/renderer/hooks/use-neptune-api";
import {
    useCliStatus,
    useCookie,
    useCoreStatus,
    useNeptuneStore,
} from "@/store/neptune.store";

interface SplashScreenProps {
    onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
    const [startupProgress, setStartupProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState("Initializing Neptune...");
    const [isReady, setIsReady] = useState(false);

    const neptuneAPI = useNeptuneAPI();
    const coreStatus = useCoreStatus();
    const cliStatus = useCliStatus();
    const cookie = useCookie();
    const { setAppStep } = useNeptuneStore((state) => state.actions);

    // Initialize Neptune processes once on mount
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                console.log("🚀 Initializing Neptune from splash screen...");
                const success = await neptuneAPI.initialize();

                if (!isMounted) return;

                if (!success) {
                    console.error("❌ Failed to start Neptune processes");
                    setAppStep("error", "Failed to start Neptune processes");
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Initialization error:", error);
                setAppStep("error", (error as Error).message);
            }
        };

        // Call initialize once
        initialize();

        return () => {
            isMounted = false;
        };
    }, [neptuneAPI.initialize, setAppStep]); // Empty dependencies - run once on mount

    // Monitor process status
    useEffect(() => {
        const statusCheckInterval = setInterval(async () => {
            try {
                const status = (await neptuneAPI.getStatus()) as {
                    success: boolean;
                    status?: {
                        core: { running: boolean; pid?: number };
                        cli: { running: boolean; pid?: number };
                        initialized: boolean;
                    };
                    error?: string;
                };

                if (status?.success && status.status) {
                    const { setCoreStatus, setCliStatus, setCookie } =
                        useNeptuneStore.getState().actions;

                    setCoreStatus(
                        status.status.core.running ? "running" : "stopped",
                        status.status.core.pid,
                    );
                    setCliStatus(
                        status.status.cli.running ? "running" : "stopped",
                        status.status.cli.pid,
                    );

                    // Check if both processes are running AND initialized
                    if (
                        status.status.core.running &&
                        status.status.cli.running &&
                        status.status.initialized &&
                        !isReady
                    ) {
                        setAppStep("ready");

                        // Fetch and store the actual cookie
                        try {
                            console.log(
                                "🔄 Fetching cookie from process manager...",
                            );
                            const cookieResult = await neptuneAPI.getCookie();
                            console.log(
                                "📥 Cookie result:",
                                cookieResult,
                                typeof cookieResult,
                            );

                            // Handle both string (direct cookie) and object response
                            if (typeof cookieResult === "string") {
                                // Direct cookie string
                                setCookie(cookieResult);
                                console.log(
                                    "✅ Cookie stored in Zustand:",
                                    cookieResult,
                                );

                                // Send cookie to main process RPC service
                                console.log(
                                    "📤 Setting cookie in RPC service...",
                                );
                                await window.electronAPI.blockchain.setCookie(
                                    cookieResult,
                                );
                                console.log("✅ Cookie set in RPC service");
                            } else if (
                                cookieResult?.success &&
                                cookieResult.cookie
                            ) {
                                // Wrapped response
                                setCookie(cookieResult.cookie);
                                console.log(
                                    "✅ Cookie stored in Zustand:",
                                    cookieResult.cookie,
                                );

                                // Send cookie to main process RPC service
                                console.log(
                                    "📤 Setting cookie in RPC service...",
                                );
                                await window.electronAPI.blockchain.setCookie(
                                    cookieResult.cookie,
                                );
                                console.log("✅ Cookie set in RPC service");
                            } else {
                                console.error(
                                    "❌ Failed to fetch cookie:",
                                    cookieResult?.error || "Unknown error",
                                );
                            }
                        } catch (error) {
                            console.error("❌ Error fetching cookie:", error);
                        }

                        setIsReady(true);
                        console.log(
                            "⏱️  Waiting 1 second before calling onReady()...",
                        );

                        setTimeout(() => {
                            console.log(
                                "✅ Calling onReady() - transitioning to main app",
                            );
                            onReady();
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error("Status check error:", error);
            }
        }, 500); // Check every 500ms

        return () => clearInterval(statusCheckInterval);
    }, [neptuneAPI, setAppStep, onReady, isReady]); // Include isReady to stop checking after ready

    // Update progress and step messages based on process status
    useEffect(() => {
        let progress = 0;
        let step = "Initializing Neptune...";

        if (coreStatus.status === "running") {
            progress = 50;
            step = "Neptune Core is running";
        }

        if (cliStatus.status === "running") {
            progress = 80;
            step = "Neptune CLI is running";
        }

        if (cookie.isValid) {
            progress = 100;
            step = "All systems ready!";
        }

        setStartupProgress(progress);
        setCurrentStep(step);
    }, [coreStatus.status, cliStatus.status, cookie.isValid]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "running":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "starting":
            case "stopping":
                return (
                    <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                );
            case "error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running":
                return "bg-green-100 text-green-800 border-green-200";
            case "starting":
            case "stopping":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "error":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <Wallet className="h-12 w-12 text-primary" />
                        <h1 className="text-4xl font-bold">Neptune</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">Core Wallet</p>
                </div>

                {/* Startup Progress */}
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Starting up...</span>
                            <span>{startupProgress}%</span>
                        </div>
                        <Progress value={startupProgress} className="w-full" />
                    </div>

                    {/* Current Step */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {currentStep}
                        </p>
                    </div>

                    {/* Process Status */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Settings className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Neptune Core
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className={getStatusColor(coreStatus.status)}
                            >
                                {getStatusIcon(coreStatus.status)}
                                <span className="ml-1 capitalize">
                                    {coreStatus.status}
                                </span>
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Wallet className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Neptune CLI
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className={getStatusColor(cliStatus.status)}
                            >
                                {getStatusIcon(cliStatus.status)}
                                <span className="ml-1 capitalize">
                                    {cliStatus.status}
                                </span>
                            </Badge>
                        </div>
                    </div>

                    {/* Cookie Status */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">
                            Authentication
                        </span>
                        <Badge
                            variant="outline"
                            className={
                                cookie.isValid
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                        >
                            {cookie.isValid ? (
                                <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Ready
                                </>
                            ) : (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Waiting
                                </>
                            )}
                        </Badge>
                    </div>
                </div>

                {/* Loading Animation */}
                {!isReady && (
                    <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
