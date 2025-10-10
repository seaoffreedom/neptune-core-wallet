/**
 * Neptune Core CLI Args Builder
 *
 * Builds CLI arguments for neptune-core from persisted settings
 * Only includes arguments that differ from defaults
 */

import type { NeptuneCoreSettings } from "../../shared/types/neptune-core-settings";
import { DEFAULT_NEPTUNE_CORE_SETTINGS } from "../../shared/types/neptune-core-settings";
import { CLI_FLAG_MAP, COMPUTED_FLAGS } from "../config/cli-flag-mapping";
import type { PeerService } from "./peer.service";

export class NeptuneCoreArgsBuilder {
    constructor(private readonly peerService: PeerService) {}

    /**
     * Builds CLI args array from settings
     * Only includes args that differ from defaults
     */
    async buildArgs(settings: NeptuneCoreSettings): Promise<string[]> {
        const args: string[] = [];

        console.log("🔧 Building CLI args from settings...");

        // Process each settings category
        this.processCategory(
            args,
            "network",
            settings.network,
            DEFAULT_NEPTUNE_CORE_SETTINGS.network,
        );
        this.processCategory(
            args,
            "mining",
            settings.mining,
            DEFAULT_NEPTUNE_CORE_SETTINGS.mining,
        );
        this.processCategory(
            args,
            "performance",
            settings.performance,
            DEFAULT_NEPTUNE_CORE_SETTINGS.performance,
        );
        this.processCategory(
            args,
            "security",
            settings.security,
            DEFAULT_NEPTUNE_CORE_SETTINGS.security,
        );
        this.processCategory(
            args,
            "data",
            settings.data,
            DEFAULT_NEPTUNE_CORE_SETTINGS.data,
        );
        this.processCategory(
            args,
            "advanced",
            settings.advanced,
            DEFAULT_NEPTUNE_CORE_SETTINGS.advanced,
        );

        // Add peer flags from peer store
        console.log(`🌐 Using network: ${settings.network.network}`);
        await this.addPeerFlags(args, settings.network.network);

        // Add computed flags
        this.addComputedFlags(args, settings);

        // Add positional arguments
        this.addPositionalArgs(args, settings);

        console.log("✅ CLI args built:", args.join(" "));
        return args;
    }

    /**
     * Process a settings category and add non-default args
     */
    private processCategory(
        args: string[],
        category: string,
        current: Record<string, unknown>,
        defaults: Record<string, unknown>,
    ): void {
        for (const [key, value] of Object.entries(current)) {
            const settingKey = `${category}.${key}`;
            const defaultValue = defaults[key];

            // Skip if value matches default
            if (this.valuesEqual(value, defaultValue)) {
                continue;
            }

            // Skip if value is null/undefined (use neptune-core's default)
            if (value === null || value === undefined) {
                continue;
            }

            // Skip empty arrays
            if (Array.isArray(value) && value.length === 0) {
                continue;
            }

            // Get flag config
            const flagConfig = CLI_FLAG_MAP[settingKey];
            if (!flagConfig) {
                console.warn(`⚠️ No CLI flag mapping for ${settingKey}`);
                continue;
            }

            // Add flag based on type
            this.addFlag(args, flagConfig, value);
        }
    }

    /**
     * Add a flag to args array
     */
    private addFlag(
        args: string[],
        config: CLIFlagConfig,
        value: unknown,
    ): void {
        if (config.type === "boolean") {
            // Boolean flag: only add if true
            if (value === true) {
                args.push(config.flag);
            }
        } else if (config.type === "array") {
            // Array flag: add multiple flags
            if (Array.isArray(value) && value.length > 0) {
                for (const item of value) {
                    args.push(config.flag, String(item));
                }
            }
        } else {
            // Value flag: add flag + value
            let stringValue = String(value);

            // Apply value transformation if defined
            if (config.valueMap && stringValue in config.valueMap) {
                stringValue = config.valueMap[stringValue];
            }

            args.push(config.flag, stringValue);
        }
    }

    /**
     * Add peer flags from peer store
     */
    private async addPeerFlags(args: string[], network: string): Promise<void> {
        try {
            const enabledPeers =
                await this.peerService.getEnabledPeers(network);

            for (const peer of enabledPeers) {
                args.push("--peer", peer.address);
            }

            if (enabledPeers.length > 0) {
                console.log(`📡 Added ${enabledPeers.length} peer flags`);
            }
        } catch (error) {
            console.error("❌ Failed to load peers for CLI args:", error);
        }
    }

    /**
     * Add computed flags that don't map directly to settings
     */
    private addComputedFlags(
        args: string[],
        settings: NeptuneCoreSettings,
    ): void {
        // --mine is computed from compose || guess
        if (settings.mining.compose || settings.mining.guess) {
            args.push(COMPUTED_FLAGS.MINE);
            console.log("⛏️ Added --mine flag (compose || guess)");
        }
    }

    /**
     * Add positional arguments
     */
    private addPositionalArgs(
        args: string[],
        settings: NeptuneCoreSettings,
    ): void {
        // Block notify command is a positional argument
        if (settings.advanced.blockNotifyCommand) {
            args.push(settings.advanced.blockNotifyCommand);
            console.log("🔔 Added block notify command as positional arg");
        }
    }

    /**
     * Compare two values for equality
     */
    private valuesEqual(a: unknown, b: unknown): boolean {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;

        // Deep comparison for objects/arrays
        if (typeof a === "object") {
            return JSON.stringify(a) === JSON.stringify(b);
        }

        return false;
    }

    /**
     * Get a preview of what CLI args would be generated
     */
    async previewArgs(settings: NeptuneCoreSettings): Promise<{
        args: string[];
        command: string;
        explanation: string[];
    }> {
        const args = await this.buildArgs(settings);
        const command = `neptune-core ${args.join(" ")}`;

        const explanation: string[] = [];
        explanation.push(`Generated ${args.length} CLI arguments:`);

        // Group args by category for explanation
        const categorized: Record<string, string[]> = {};
        let i = 0;
        while (i < args.length) {
            const arg = args[i];
            if (arg.startsWith("--")) {
                const value =
                    i + 1 < args.length && !args[i + 1].startsWith("--")
                        ? args[i + 1]
                        : "";
                const category = this.getArgCategory(arg);
                if (!categorized[category]) categorized[category] = [];
                categorized[category].push(`${arg}${value ? ` ${value}` : ""}`);
                i += value ? 2 : 1;
            } else {
                // Positional argument
                if (!categorized["Positional"]) categorized["Positional"] = [];
                categorized["Positional"].push(arg);
                i++;
            }
        }

        for (const [category, flags] of Object.entries(categorized)) {
            explanation.push(`  ${category}: ${flags.join(", ")}`);
        }

        return { args, command, explanation };
    }

    /**
     * Get category for a CLI argument (for explanation purposes)
     */
    private getArgCategory(arg: string): string {
        if (arg.includes("peer") || arg.includes("network")) return "Network";
        if (
            arg.includes("mine") ||
            arg.includes("compose") ||
            arg.includes("guess")
        )
            return "Mining";
        if (
            arg.includes("proof") ||
            arg.includes("mempool") ||
            arg.includes("sync")
        )
            return "Performance";
        if (
            arg.includes("ban") ||
            arg.includes("security") ||
            arg.includes("scan")
        )
            return "Security";
        if (
            arg.includes("data") ||
            arg.includes("import") ||
            arg.includes("dir")
        )
            return "Data";
        if (arg.includes("tokio") || arg.includes("console")) return "Advanced";
        return "Other";
    }
}
