# CLI Args Builder Implementation Plan

## Overview
System for building Neptune Core CLI arguments from persisted settings, only including non-default values.

## Dependencies
- **Peer Management System** (see `PEER-MANAGEMENT-PLAN.md`) - Must be implemented first
- Settings are already persisted via `electron-store`
- Settings defaults will be defined in a central config file

## Architecture

### 1. **Defaults Configuration** (`src/main/config/neptune-core-defaults.ts`)

```typescript
export const NEPTUNE_CORE_DEFAULTS = {
  network: {
    network: 'main',
    peerPort: 9798,
    rpcPort: 9799,
    maxPeers: 10,
    // bootstrapPeers removed - handled by peer store
  },
  mining: {
    miningEnabled: false,
    miningDifficulty: null,        // null = not specified, use neptune-core default
    cpuThreads: null,
  },
  performance: {
    maxUtxoSetSize: null,
    pruneBlockHistory: false,
    pruneDepth: null,
  },
  security: {
    authCookie: true,               // true = default behavior (no flag needed)
    disableAuth: false,
    allowRemoteRpc: false,
  },
  data: {
    dataDirectory: null,            // null = use neptune-core default
    logLevel: 'info',
  },
  advanced: {
    archivalState: false,
    disableTimestampValidation: false,
    customFlags: '',
  },
} as const;

export type NeptuneCoreDefaults = typeof NEPTUNE_CORE_DEFAULTS;
```

### 2. **CLI Flag Mapping** (`src/main/config/cli-flag-mapping.ts`)

```typescript
/**
 * Maps settings keys to neptune-core CLI flags
 * 
 * Format: 'category.key' -> CLI flag info
 */
export const CLI_FLAG_MAP: Record<string, CLIFlagConfig> = {
  // Network
  'network.network': {
    flag: '--network',
    type: 'value',
    valueMap: { main: 'main', testnet: 'testnet', regtest: 'regtest' },
  },
  'network.peerPort': {
    flag: '--peer-port',
    type: 'value',
  },
  'network.rpcPort': {
    flag: '--rpc-port',
    type: 'value',
  },
  'network.maxPeers': {
    flag: '--max-num-peers',
    type: 'value',
  },
  
  // Mining
  'mining.miningEnabled': {
    flag: '--mine',
    type: 'boolean',         // No value, presence = enabled
  },
  'mining.miningDifficulty': {
    flag: '--mining-difficulty',
    type: 'value',
  },
  'mining.cpuThreads': {
    flag: '--cpu-threads',
    type: 'value',
  },
  
  // Performance
  'performance.maxUtxoSetSize': {
    flag: '--max-utxo-set-size',
    type: 'value',
  },
  'performance.pruneBlockHistory': {
    flag: '--prune-history',
    type: 'boolean',
  },
  'performance.pruneDepth': {
    flag: '--prune-depth',
    type: 'value',
  },
  
  // Security
  'security.disableAuth': {
    flag: '--disable-auth',
    type: 'boolean',
  },
  'security.allowRemoteRpc': {
    flag: '--allow-remote-rpc',
    type: 'boolean',
  },
  
  // Data
  'data.dataDirectory': {
    flag: '--data-dir',
    type: 'value',
  },
  'data.logLevel': {
    flag: '--log-level',
    type: 'value',
    valueMap: { debug: 'debug', info: 'info', warn: 'warn', error: 'error' },
  },
  
  // Advanced
  'advanced.archivalState': {
    flag: '--archival-state',
    type: 'boolean',
  },
  'advanced.disableTimestampValidation': {
    flag: '--disable-timestamp-validation',
    type: 'boolean',
  },
};

export interface CLIFlagConfig {
  flag: string;                      // CLI flag name
  type: 'value' | 'boolean';         // Flag type
  valueMap?: Record<string, string>; // Optional value transformation
}
```

### 3. **Args Builder Service** (`src/main/services/neptune-core-args-builder.ts`)

```typescript
export class NeptuneCoreArgsBuilder {
  constructor(
    private readonly peerService: PeerService,
  ) {}
  
  /**
   * Builds CLI args array from settings
   * Only includes args that differ from defaults
   */
  async buildArgs(settings: NeptuneCoreSettings): Promise<string[]> {
    const args: string[] = [];
    
    // Process each settings category
    this.processCategory(args, 'network', settings.network, NEPTUNE_CORE_DEFAULTS.network);
    this.processCategory(args, 'mining', settings.mining, NEPTUNE_CORE_DEFAULTS.mining);
    this.processCategory(args, 'performance', settings.performance, NEPTUNE_CORE_DEFAULTS.performance);
    this.processCategory(args, 'security', settings.security, NEPTUNE_CORE_DEFAULTS.security);
    this.processCategory(args, 'data', settings.data, NEPTUNE_CORE_DEFAULTS.data);
    this.processCategory(args, 'advanced', settings.advanced, NEPTUNE_CORE_DEFAULTS.advanced);
    
    // Add peer flags from peer store
    await this.addPeerFlags(args, settings.network.network);
    
    // Add custom flags (if any)
    this.addCustomFlags(args, settings.advanced.customFlags);
    
    return args;
  }
  
  /**
   * Process a settings category and add non-default args
   */
  private processCategory(
    args: string[],
    category: string,
    current: Record<string, any>,
    defaults: Record<string, any>,
  ): void {
    for (const [key, value] of Object.entries(current)) {
      const settingKey = `${category}.${key}`;
      const defaultValue = defaults[key];
      
      // Skip if value matches default
      if (this.valuesEqual(value, defaultValue)) {
        continue;
      }
      
      // Skip if value is null (use neptune-core's default)
      if (value === null) {
        continue;
      }
      
      // Get flag config
      const flagConfig = CLI_FLAG_MAP[settingKey];
      if (!flagConfig) {
        console.warn(`No CLI flag mapping for ${settingKey}`);
        continue;
      }
      
      // Add flag based on type
      this.addFlag(args, flagConfig, value);
    }
  }
  
  /**
   * Add a flag to args array
   */
  private addFlag(args: string[], config: CLIFlagConfig, value: any): void {
    if (config.type === 'boolean') {
      // Boolean flag: only add if true
      if (value === true) {
        args.push(config.flag);
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
    const enabledPeers = await this.peerService.getEnabledPeers(network);
    
    for (const peer of enabledPeers) {
      args.push('--peer', peer.address);
    }
  }
  
  /**
   * Add custom flags (raw string parsing)
   */
  private addCustomFlags(args: string[], customFlags: string): void {
    if (!customFlags || customFlags.trim() === '') {
      return;
    }
    
    // Parse custom flags string
    // Simple space-splitting (doesn't handle quoted values yet)
    const customArgs = customFlags.trim().split(/\s+/).filter(Boolean);
    args.push(...customArgs);
  }
  
  /**
   * Compare two values for equality
   */
  private valuesEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    // Deep comparison for objects/arrays
    if (typeof a === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    
    return false;
  }
}
```

### 4. **Settings Initializer** (`src/main/services/settings-initializer.ts`)

```typescript
export class SettingsInitializer {
  constructor(
    private readonly settingsStore: Store<NeptuneCoreSettings>,
  ) {}
  
  /**
   * Initialize settings with defaults on first run
   */
  initializeIfNeeded(): void {
    const existingSettings = this.settingsStore.get('settings');
    
    if (!existingSettings || Object.keys(existingSettings).length === 0) {
      console.log('First run detected, initializing settings with defaults');
      this.settingsStore.set('settings', NEPTUNE_CORE_DEFAULTS);
    } else {
      // Merge with defaults to add any new settings
      const merged = this.mergeWithDefaults(existingSettings);
      this.settingsStore.set('settings', merged);
    }
  }
  
  /**
   * Merge existing settings with defaults
   * Adds any missing keys from defaults
   */
  private mergeWithDefaults(
    existing: Partial<NeptuneCoreSettings>,
  ): NeptuneCoreSettings {
    return {
      network: { ...NEPTUNE_CORE_DEFAULTS.network, ...existing.network },
      mining: { ...NEPTUNE_CORE_DEFAULTS.mining, ...existing.mining },
      performance: { ...NEPTUNE_CORE_DEFAULTS.performance, ...existing.performance },
      security: { ...NEPTUNE_CORE_DEFAULTS.security, ...existing.security },
      data: { ...NEPTUNE_CORE_DEFAULTS.data, ...existing.data },
      advanced: { ...NEPTUNE_CORE_DEFAULTS.advanced, ...existing.advanced },
    };
  }
}
```

### 5. **Integration with Neptune Core Service** (`src/main/services/neptune-core.service.ts`)

```typescript
export class NeptuneCoreService {
  private argsBuilder: NeptuneCoreArgsBuilder;
  
  constructor() {
    this.argsBuilder = new NeptuneCoreArgsBuilder(peerService);
  }
  
  async spawnNeptuneCore(): Promise<void> {
    // Load settings from store
    const settings = settingsStore.get('settings');
    
    // Build CLI args
    const args = await this.argsBuilder.buildArgs(settings);
    
    console.log('Starting neptune-core with args:', args.join(' '));
    
    // Spawn process
    this.neptuneCoreProcess = execa(this.binaryPath, args, {
      cwd: process.cwd(),
      env: { ...process.env },
      // ... other options
    });
  }
}
```

## Special Handling Cases

### 1. **Null Values** (Use Neptune Core Default)
```typescript
// Setting value is null -> Don't include flag
if (value === null) {
  continue; // Let neptune-core use its own default
}
```

### 2. **Boolean Flags** (No Value)
```typescript
// true -> --mine
// false -> (omit flag)
if (config.type === 'boolean' && value === true) {
  args.push(config.flag);
}
```

### 3. **Peer Flags** (Multiple)
```typescript
// For each enabled peer, add --peer flag
enabledPeers.forEach(peer => {
  args.push('--peer', peer.address);
});
```

### 4. **Custom Flags** (Raw String)
```typescript
// customFlags: '--custom-option value --another-flag'
// Split by whitespace and append
const customArgs = customFlags.trim().split(/\s+/);
args.push(...customArgs);
```

### 5. **Value Transformation** (Enum Mapping)
```typescript
// logLevel: 'info' -> '--log-level' 'info'
// Use valueMap if defined for validation
if (config.valueMap && value in config.valueMap) {
  value = config.valueMap[value];
}
```

## Example Output

### Scenario: User Changes Network and Max Peers

**Settings**:
```json
{
  "network": {
    "network": "testnet",   // Changed from default 'main'
    "peerPort": 9798,       // Same as default
    "rpcPort": 9799,        // Same as default
    "maxPeers": 20          // Changed from default 10
  }
}
```

**Generated Args**:
```typescript
['--network', 'testnet', '--max-num-peers', '20', '--peer', '51.15.139.238:9798', '--peer', '139.162.193.206:9798']
```

**Command**:
```bash
neptune-core --network testnet --max-num-peers 20 --peer 51.15.139.238:9798 --peer 139.162.193.206:9798
```

## Testing Strategy

### Unit Tests
```typescript
describe('NeptuneCoreArgsBuilder', () => {
  it('should only include non-default values', () => {
    const settings = { ...DEFAULTS, network: { ...DEFAULTS.network, maxPeers: 20 } };
    const args = argsBuilder.buildArgs(settings);
    expect(args).toContain('--max-num-peers');
    expect(args).toContain('20');
  });
  
  it('should handle boolean flags correctly', () => {
    const settings = { ...DEFAULTS, mining: { miningEnabled: true } };
    const args = argsBuilder.buildArgs(settings);
    expect(args).toContain('--mine');
  });
  
  it('should skip null values', () => {
    const settings = { ...DEFAULTS, mining: { cpuThreads: null } };
    const args = argsBuilder.buildArgs(settings);
    expect(args).not.toContain('--cpu-threads');
  });
  
  it('should add peer flags', async () => {
    peerService.getEnabledPeers = jest.fn().mockResolvedValue([
      { address: 'peer1:9798' },
      { address: 'peer2:9798' },
    ]);
    const args = await argsBuilder.buildArgs(DEFAULTS);
    expect(args).toContain('--peer');
    expect(args).toContain('peer1:9798');
    expect(args).toContain('peer2:9798');
  });
});
```

## Migration Path

### Phase 1: Infrastructure (First)
1. ✅ Peer management system implemented
2. Create defaults configuration
3. Create CLI flag mapping
4. Create settings initializer

### Phase 2: Args Builder
1. Implement args builder service
2. Add unit tests
3. Integrate with neptune-core service

### Phase 3: Integration
1. Use args builder in spawn logic
2. Test with various setting combinations
3. Verify process starts correctly

### Phase 4: Cleanup
1. Remove hardcoded args from spawn logic
2. Document CLI flag mapping
3. Add validation for unknown flags

## Open Questions

1. **Custom Flags Parsing**: Should we implement proper shell-style parsing (handle quotes, escaping)?
2. **Flag Validation**: Should we validate CLI flags against neptune-core's help output?
3. **Flag Conflicts**: How to handle conflicting flags (e.g., custom flags vs settings)?
4. **Logging**: Should we log the full command for debugging?
5. **Restart Detection**: Which settings changes require a restart?

## Answers to Original Questions

1. **Defaults Source**: Keep hardcoded for simplicity and reliability
2. **Validation**: Trust form validation, args builder doesn't re-validate
3. **Restart Logic**: Settings changes set "restart required" flag, user controls restart
4. **CLI Flag Discovery**: Manual mapping, more maintainable than parsing
5. **Custom Flags Safety**: Basic validation (no shell injection), trust local user
6. **Default Data Directory**: Use neptune-core's default unless explicitly set

## File Structure

```
src/
├── main/
│   ├── config/
│   │   ├── neptune-core-defaults.ts    # Default settings
│   │   └── cli-flag-mapping.ts         # CLI flag configurations
│   └── services/
│       ├── settings-initializer.ts     # First-run initialization
│       ├── neptune-core-args-builder.ts # Args builder
│       └── neptune-core.service.ts     # Integration point
```

## Next Steps

1. ✅ Implement peer management system (prerequisite)
2. Create defaults and flag mapping configs
3. Implement settings initializer
4. Implement args builder service
5. Write unit tests
6. Integrate with neptune-core service
7. Test end-to-end

---

**Status**: Waiting for peer management system to be implemented first.
