/**
 * Splash Screen Component
 *
 * Shows during app startup while Neptune processes are initializing.
 * This screen appears before the main app UI loads.
 */

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { getLogoPath } from "@/shared/utils/asset-paths";
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
    const { theme } = useTheme();

    // Get theme-specific styling
    const getThemeClasses = () => {
        switch (theme) {
            case "light":
                return {
                    background:
                        "bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50",
                    textPrimary: "text-slate-900",
                    textSecondary: "text-slate-600",
                    textMuted: "text-slate-500",
                    logoBg: "bg-gradient-to-br from-cyan-600 to-blue-700",
                    logoGlow: "shadow-cyan-500/20",
                    logoBorder: "border-cyan-500/20",
                    titleGradient: "from-cyan-600 via-blue-600 to-blue-800",
                    progressBg: "bg-slate-200/80",
                    progressBar: "from-cyan-600 to-blue-700",
                    progressGlow: "from-cyan-600/30 to-blue-700/40",
                    spinnerBorder: "border-cyan-500/30",
                    spinnerAccent: "border-cyan-500/60",
                    orbColors: {
                        primary: "bg-cyan-500/8",
                        secondary: "bg-blue-600/10",
                        tertiary: "bg-slate-400/12",
                        accent: "bg-cyan-400/6",
                    },
                };
            case "nautical":
                return {
                    background:
                        "bg-gradient-to-br from-slate-950 via-slate-950 to-black",
                    textPrimary: "text-cyan-300",
                    textSecondary: "text-slate-400",
                    textMuted: "text-slate-500",
                    logoBg: "bg-gradient-to-br from-cyan-600 to-blue-900",
                    logoGlow: "shadow-cyan-500/10",
                    logoBorder: "border-cyan-500/15",
                    titleGradient: "from-cyan-300 via-blue-400 to-blue-800",
                    progressBg: "bg-slate-900/80",
                    progressBar: "from-cyan-600 to-blue-800",
                    progressGlow: "from-cyan-600/25 to-blue-800/30",
                    spinnerBorder: "border-cyan-500/15",
                    spinnerAccent: "border-cyan-500/60",
                    orbColors: {
                        primary: "bg-cyan-500/4",
                        secondary: "bg-blue-900/6",
                        tertiary: "bg-slate-800/8",
                        accent: "bg-cyan-400/2",
                    },
                };
            default:
                return {
                    background:
                        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
                    textPrimary: "text-slate-100",
                    textSecondary: "text-slate-300",
                    textMuted: "text-slate-400",
                    logoBg: "bg-gradient-to-br from-slate-600 to-slate-800",
                    logoGlow: "shadow-slate-500/10",
                    logoBorder: "border-slate-500/15",
                    titleGradient: "from-slate-200 via-slate-300 to-slate-400",
                    progressBg: "bg-slate-800/80",
                    progressBar: "from-slate-600 to-slate-700",
                    progressGlow: "from-slate-600/25 to-slate-700/30",
                    spinnerBorder: "border-slate-500/15",
                    spinnerAccent: "border-slate-500/60",
                    orbColors: {
                        primary: "bg-slate-500/4",
                        secondary: "bg-slate-600/6",
                        tertiary: "bg-slate-700/8",
                        accent: "bg-slate-400/2",
                    },
                };
        }
    };

    const themeClasses = getThemeClasses();

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
        <div
            className={`min-h-screen ${themeClasses.background} flex items-center justify-center p-4 relative overflow-hidden`}
        >
            {/* Animated Background Effects - Theme-aware */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary orbs */}
                <div
                    className={`absolute top-1/4 left-1/4 w-96 h-96 ${themeClasses.orbColors.primary} rounded-full blur-3xl animate-pulse`}
                ></div>
                <div
                    className={`absolute top-3/4 right-1/4 w-80 h-80 ${themeClasses.orbColors.secondary} rounded-full blur-3xl animate-pulse delay-1000`}
                ></div>
                <div
                    className={`absolute bottom-1/4 left-1/3 w-64 h-64 ${themeClasses.orbColors.tertiary} rounded-full blur-3xl animate-pulse delay-2000`}
                ></div>

                {/* Moving gradient orbs */}
                <div
                    className={`absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r ${themeClasses.orbColors.primary} to-${themeClasses.orbColors.secondary} rounded-full blur-2xl animate-spin-slow`}
                ></div>
                <div
                    className={`absolute top-1/3 right-1/3 w-56 h-56 bg-gradient-to-r ${themeClasses.orbColors.tertiary} to-${themeClasses.orbColors.primary} rounded-full blur-2xl animate-spin-slow-reverse`}
                ></div>

                {/* Additional depth layers */}
                <div
                    className={`absolute top-1/6 right-1/6 w-48 h-48 bg-gradient-to-r ${themeClasses.orbColors.secondary} to-${themeClasses.orbColors.tertiary} rounded-full blur-3xl animate-pulse delay-3000`}
                ></div>
                <div
                    className={`absolute bottom-1/6 left-1/6 w-40 h-40 bg-gradient-to-r ${themeClasses.orbColors.primary} to-${themeClasses.orbColors.secondary} rounded-full blur-2xl animate-pulse delay-4000`}
                ></div>

                {/* Accent effects */}
                <div
                    className={`absolute top-1/5 left-1/5 w-32 h-32 ${themeClasses.orbColors.accent} rounded-full blur-xl animate-pulse delay-5000`}
                ></div>
                <div
                    className={`absolute bottom-1/5 right-1/5 w-28 h-28 ${themeClasses.orbColors.accent} rounded-full blur-xl animate-pulse delay-6000`}
                ></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-lg space-y-12">
                {/* Logo and Title */}
                <div className="text-center space-y-6">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            {/* Logo with theme-aware styling */}
                            <div
                                className={`w-24 h-24 mx-auto ${themeClasses.logoBg} rounded-2xl flex items-center justify-center shadow-2xl ${themeClasses.logoGlow} border ${themeClasses.logoBorder}`}
                            >
                                <img
                                    src={getLogoPath("neptune.svg")}
                                    alt="Neptune Logo"
                                    className={`w-16 h-16 ${theme === "light" ? "filter brightness-0 invert" : "filter brightness-0 invert"}`}
                                />
                            </div>
                            {/* Theme-aware glow rings */}
                            <div
                                className={`absolute inset-0 w-24 h-24 mx-auto ${themeClasses.logoBg} rounded-2xl blur-xl opacity-20`}
                            ></div>
                            <div
                                className={`absolute inset-0 w-24 h-24 mx-auto ${themeClasses.logoBg} rounded-2xl blur-2xl opacity-10`}
                            ></div>
                            <div
                                className={`absolute inset-0 w-24 h-24 mx-auto ${themeClasses.logoBg} rounded-2xl blur-3xl opacity-5`}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1
                            className={`text-5xl font-bold bg-gradient-to-r ${themeClasses.titleGradient} bg-clip-text text-transparent drop-shadow-2xl`}
                        >
                            Neptune
                        </h1>
                        <p
                            className={`text-xl ${themeClasses.textSecondary} font-light tracking-wide`}
                        >
                            Core Wallet
                        </p>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-8">
                    {/* Large Progress Bar */}
                    <div className="space-y-4">
                        <div
                            className={`flex justify-between text-sm ${themeClasses.textSecondary}`}
                        >
                            <span>Loading</span>
                            <span
                                className={`font-mono ${themeClasses.textPrimary}`}
                            >
                                {progress}%
                            </span>
                        </div>
                        <div className="relative">
                            <div
                                className={`w-full h-3 ${themeClasses.progressBg} rounded-full overflow-hidden border border-slate-800/40`}
                            >
                                <div
                                    className={`h-full bg-gradient-to-r ${themeClasses.progressBar} rounded-full transition-all duration-1000 ease-out relative`}
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Enhanced shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
                                    {/* Inner glow */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-r ${themeClasses.progressBar} rounded-full opacity-30`}
                                    ></div>
                                </div>
                            </div>
                            {/* Enhanced glow effect */}
                            <div
                                className={`absolute top-0 h-3 bg-gradient-to-r ${themeClasses.progressGlow} rounded-full blur-sm transition-all duration-1000 ease-out`}
                                style={{ width: `${progress}%` }}
                            ></div>
                            <div
                                className={`absolute top-0 h-3 bg-gradient-to-r ${themeClasses.progressGlow} rounded-full blur-md transition-all duration-1000 ease-out opacity-50`}
                                style={{ width: `${progress}%` }}
                            ></div>
                            {/* Accent glow */}
                            <div
                                className={`absolute top-0 h-3 bg-gradient-to-r ${themeClasses.progressGlow} rounded-full blur-lg transition-all duration-1000 ease-out opacity-30`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Subtle Loading Step */}
                    <div className="text-center">
                        <p
                            className={`${themeClasses.textMuted} text-sm font-light tracking-wide`}
                        >
                            {currentStep}
                        </p>
                    </div>
                </div>

                {/* Loading Animation - Always reserve space to prevent layout shift */}
                <div className="flex justify-center h-8">
                    {!isReady && (
                        <div className="relative">
                            <div
                                className={`w-8 h-8 border-2 ${themeClasses.spinnerBorder} border-t-${themeClasses.spinnerAccent} rounded-full animate-spin`}
                            ></div>
                            <div
                                className={`absolute inset-0 w-8 h-8 border-2 border-transparent border-t-${themeClasses.spinnerAccent} rounded-full animate-spin`}
                                style={{
                                    animationDirection: "reverse",
                                    animationDuration: "1.5s",
                                }}
                            ></div>
                            {/* Accent ring */}
                            <div
                                className={`absolute inset-0 w-8 h-8 border ${themeClasses.spinnerBorder} rounded-full animate-pulse`}
                                style={{
                                    animationDuration: "2s",
                                }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
