/**
 * Neptune Core CLI Args Builder
 *
 * Builds CLI arguments for neptune-core from persisted settings
 * Only includes arguments that differ from defaults
 */

import type { NeptuneCoreSettings } from "../../shared/types/neptune-core-settings";
import { DEFAULT_NEPTUNE_CORE_SETTINGS } from "../../shared/types/neptune-core-settings";
import {
    CLI_FLAG_MAP,
    COMPUTED_FLAGS,
    CLIFlagConfig,
} from "../config/cli-flag-mapping";
import type { PeerService } from "./peer.service";

export class NeptuneCoreArgsBuilder {
    constructor(private readonly peerService: PeerService) {}

    /**
     * Builds CLI args array from settings
     * Only includes args that differ from defaults
     */
    async buildArgs(settings: NeptuneCoreSettings): Promise<string[]> {
        const args: string[] = [];

        // Process each settings category
        this.processCategory(
            args,
            "network",
            settings.network as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.network as Record<string, unknown>,
        );
        this.processCategory(
            args,
            "mining",
            settings.mining as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.mining as Record<string, unknown>,
        );
        this.processCategory(
            args,
            "performance",
            settings.performance as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.performance as Record<
                string,
                unknown
            >,
        );
        this.processCategory(
            args,
            "security",
            settings.security as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.security as Record<string, unknown>,
        );
        this.processCategory(
            args,
            "data",
            settings.data as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.data as Record<string, unknown>,
        );
        this.processCategory(
            args,
            "advanced",
            settings.advanced as Record<string, unknown>,
            DEFAULT_NEPTUNE_CORE_SETTINGS.advanced as Record<string, unknown>,
        );

        // Add peer flags from peer store
        await this.addPeerFlags(args, settings.network.network);

        // Add computed flags
        this.addComputedFlags(args, settings);

        // Add positional arguments
        this.addPositionalArgs(args, settings);

        // CLI args built successfully
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
                // No CLI flag mapping for this setting - skipping
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

            // Added peer flags successfully
        } catch (error) {
            // Failed to load peers for CLI args - continuing without peers
        }
    }

    /**
     * Add computed flags that don't map directly to settings
     */
    private addComputedFlags(
        args: string[],
        settings: NeptuneCoreSettings,
    ): void {
        // No computed flags needed - all flags are handled by the CLI flag mapping
        // The --mine flag doesn't exist in neptune-core
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
            // Added block notify command as positional arg
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
