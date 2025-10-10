/**
 * Splash Screen Component
 *
 * Shows during app startup while Neptune processes are initializing.
 * This screen appears before the main app UI loads.
 */

import { useEffect, useState } from "react";
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
    const [currentStep, setCurrentStep] = useState("Initializing Neptune...");
    const [isReady, setIsReady] = useState(false);

    const neptuneAPI = useNeptuneAPI();
    const coreStatus = useCoreStatus();
    const cliStatus = useCliStatus();
    const cookie = useCookie();
    const { setAppStep } = useNeptuneStore((state) => state.actions);

    // Calculate progress based on status
    const calculateProgress = () => {
        let progress = 0;

        if (coreStatus.status === "running") progress += 40;
        if (cliStatus.status === "running") progress += 30;
        if (cookie.isValid) progress += 20;
        if (isReady) progress += 10;

        return Math.min(progress, 100);
    };

    const progress = calculateProgress();

    // Initialize Neptune processes once on mount
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                const success = await neptuneAPI.initialize();

                if (!isMounted) return;

                if (!success) {
                    setAppStep("error", "Failed to start Neptune processes");
                }
            } catch (error) {
                if (!isMounted) return;
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
                            const cookieResult = await neptuneAPI.getCookie();

                            // Handle both string (direct cookie) and object response
                            if (typeof cookieResult === "string") {
                                // Direct cookie string
                                setCookie(cookieResult);
                                await window.electronAPI.blockchain.setCookie(
                                    cookieResult,
                                );
                            } else if (
                                cookieResult &&
                                typeof cookieResult === "object" &&
                                "success" in cookieResult &&
                                "cookie" in cookieResult
                            ) {
                                const wrappedResult = cookieResult as {
                                    success: boolean;
                                    cookie: string;
                                };
                                if (
                                    wrappedResult.success &&
                                    wrappedResult.cookie
                                ) {
                                    // Wrapped response
                                    setCookie(wrappedResult.cookie);
                                    await window.electronAPI.blockchain.setCookie(
                                        wrappedResult.cookie,
                                    );
                                }
                            }
                        } catch {
                            // Silently handle cookie fetch errors
                        }

                        setIsReady(true);

                        setTimeout(() => {
                            onReady();
                        }, 1000);
                    }
                }
            } catch {
                // Silently handle status check errors
            }
        }, 500); // Check every 500ms

        return () => clearInterval(statusCheckInterval);
    }, [neptuneAPI, setAppStep, onReady, isReady]); // Include isReady to stop checking after ready

    // Update step messages based on process status
    useEffect(() => {
        let step = "Initializing Neptune...";

        if (coreStatus.status === "running") {
            step = "Starting Neptune Core";
        }

        if (cliStatus.status === "running") {
            step = "Connecting to CLI";
        }

        if (cookie.isValid) {
            step = "Authenticating";
        }

        if (isReady) {
            step = "Ready";
        }

        setCurrentStep(step);
    }, [coreStatus.status, cliStatus.status, cookie.isValid, isReady]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating neon orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

                {/* Moving gradient orbs */}
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl animate-spin-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-56 h-56 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-spin-slow-reverse"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-lg space-y-12">
                {/* Logo and Title */}
                <div className="text-center space-y-6">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            {/* Logo with glow effect */}
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                                <img
                                    src="/assets/logos/neptune.svg"
                                    alt="Neptune Logo"
                                    className="w-16 h-16 filter brightness-0 invert"
                                />
                            </div>
                            {/* Glow ring */}
                            <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-2xl blur-xl animate-pulse"></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Neptune
                        </h1>
                        <p className="text-xl text-slate-400 font-light">
                            Core Wallet
                        </p>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-8">
                    {/* Large Progress Bar */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Loading</span>
                            <span className="font-mono">{progress}%</span>
                        </div>
                        <div className="relative">
                            <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                </div>
                            </div>
                            {/* Glow effect */}
                            <div
                                className="absolute top-0 h-3 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 rounded-full blur-sm transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Subtle Loading Step */}
                    <div className="text-center">
                        <p className="text-slate-500 text-sm font-light tracking-wide">
                            {currentStep}
                        </p>
                    </div>
                </div>

                {/* Loading Animation */}
                {!isReady && (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
