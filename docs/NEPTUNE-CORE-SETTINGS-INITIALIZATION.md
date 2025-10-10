# Neptune Core Settings - Initialization & Defaults

## Overview

This document describes the automatic settings initialization system that ensures Neptune Core settings are properly configured on first run.

---

## Architecture

### Components

1. **Settings Initializer Service** (`settings-initializer.service.ts`)
   - Checks for existing settings on startup
   - Validates all required categories
   - Initializes with verified defaults if needed
   - Provides fallback error handling

2. **Settings Service** (`neptune-core-settings.service.ts`)
   - Manages persistent storage using `electron-store`
   - Handles CRUD operations
   - Encrypts sensitive settings

3. **Main Process Integration** (`main/index.ts`)
   - Initializes settings before IPC handlers
   - Runs before window creation
   - Ensures settings exist before any operations

---

## Initialization Flow

```
App Startup
    ↓
1. app.whenReady()
    ↓
2. settingsInitializerService.initializeSettings()
    ↓
3. Check if settings exist
    ↓
    ├─ Valid settings found → Continue
    │                           ↓
    │                      Log success
    │
    └─ Invalid/missing settings → Initialize
                                     ↓
                              resetToDefaults()
                                     ↓
                              Save to electron-store
                                     ↓
                              Log initialization
    ↓
4. registerAllHandlers() (IPC)
    ↓
5. createWindow()
    ↓
6. App ready for use
```

---

## Validation Logic

Settings are considered **valid** if ALL categories exist:

```typescript
const hasValidSettings =
  existingSettings?.network &&
  existingSettings?.mining &&
  existingSettings?.performance &&
  existingSettings?.security &&
  existingSettings?.data &&
  existingSettings?.advanced;
```

If any category is missing or corrupted:

1. Reset to defaults
2. Save to persistent storage
3. Log the action
4. Continue startup

---

## Default Values Source

All defaults are verified against the neptune-core source code:

**Source File**: `/neptune-core/src/application/config/cli_args.rs`

**Verification Date**: 2025-10-10

See [`NEPTUNE-CORE-DEFAULTS-MAPPING.md`](./NEPTUNE-CORE-DEFAULTS-MAPPING.md) for a complete mapping of all CLI arguments to TypeScript defaults.

---

## Storage

### Location

Settings are stored using `electron-store` with the following paths:

- **Linux**: `~/.config/neptune-core-wallet/neptune-core-settings.json`
- **Windows**: `%APPDATA%\neptune-core-wallet\neptune-core-settings.json`
- **macOS**: `~/Library/Application Support/neptune-core-wallet/neptune-core-settings.json`

### Encryption

Sensitive settings are encrypted at rest:

- Symmetric encryption for fee notification keys
- Secure storage of authentication credentials
- Protection of private configuration data

### Format

```json
{
  "network": {
    "network": "main",
    "peerPort": 9798,
    "rpcPort": 9799,
    "peerListenAddr": "::",
    "peers": [],
    "maxNumPeers": 10,
    "peerTolerance": 1000,
    "reconnectCooldown": 1800,
    "restrictPeersToList": false,
    "bootstrap": false
  },
  "mining": {
    "txProofUpgrading": false,
    "txUpgradeFilter": "1:0",
    "gobblingFraction": 0.6,
    "minGobblingFee": 0.01,
    "compose": false,
    "maxNumComposeMergers": 1,
    "secretCompositions": false,
    "whitelistedComposers": [],
    "ignoreForeignCompositions": false,
    "guess": false,
    "guesserFraction": 0.5,
    "minimumGuesserFraction": 0.5,
    "minimumGuesserImprovementFraction": 0.17
  },
  "performance": {
    "maxNumProofs": 16,
    "syncModeThreshold": 1000,
    "maxMempoolSize": "1G",
    "numberOfMpsPerUtxo": 3
  },
  "security": {
    "disableCookieHint": false,
    "bannedIps": [],
    "noTransactionInitiation": false,
    "feeNotification": "on-chain-symmetric"
  },
  "data": {
    "importBlockFlushPeriod": 250,
    "disableValidationInBlockImport": false
  },
  "advanced": {
    "tokioConsole": false
  }
}
```

---

## Error Handling

### Primary Initialization

```typescript
try {
  const existingSettings = neptuneCoreSettingsService.getAll();
  if (!hasValidSettings) {
    neptuneCoreSettingsService.resetToDefaults();
    logger.info("✅ Default settings initialized successfully");
  }
} catch (error) {
  logger.error({ error }, "Failed to initialize settings");
  // Fallback...
}
```

### Fallback Initialization

If primary initialization fails:

```typescript
catch (error) {
    logger.warn("Attempting to reset to defaults as fallback...");
    neptuneCoreSettingsService.resetToDefaults();
    logger.info("✅ Fallback initialization successful");
}
```

If both fail → throw error and prevent app startup

---

## Logging

The initializer provides detailed logging:

### First Run (No Settings)

```
[INFO] Checking if settings exist...
[INFO] No valid settings found, initializing with defaults...
[INFO] ✅ Default settings initialized successfully
       ~/.config/neptune-core-wallet/neptune-core-settings.json
```

### Subsequent Runs (Settings Exist)

```
[INFO] Checking if settings exist...
[INFO] ✅ Existing settings found and valid
```

### Error Cases

```
[ERROR] Failed to initialize settings
[WARN] Attempting to reset to defaults as fallback...
[INFO] ✅ Fallback initialization successful
```

---

## API

### Service Methods

```typescript
// Get all settings
const settings = neptuneCoreSettingsService.getAll();

// Reset to defaults
neptuneCoreSettingsService.resetToDefaults();

// Check initialization status
const initialized = settingsInitializerService.isInitialized();

// Force re-initialization (testing/recovery)
await settingsInitializerService.forceReinitialize();
```

### From Renderer (IPC)

```typescript
// Get all settings
const result = await window.electronAPI.neptuneCoreSettings.getAll();

// Update settings
const result = await window.electronAPI.neptuneCoreSettings.updateNetwork({
  maxNumPeers: 20,
});

// Reset to defaults
const result = await window.electronAPI.neptuneCoreSettings.resetToDefaults();
```

---

## Testing

### Manual Testing

1. **First Run**:

   ```bash
   # Remove existing settings
   rm ~/.config/neptune-core-wallet/neptune-core-settings.json

   # Start app
   npm start

   # Check logs for initialization
   # Verify settings file was created
   cat ~/.config/neptune-core-wallet/neptune-core-settings.json
   ```

2. **Corrupted Settings**:

   ```bash
   # Manually corrupt settings file
   echo "{}" > ~/.config/neptune-core-wallet/neptune-core-settings.json

   # Start app
   npm start

   # Should detect invalid settings and reset to defaults
   ```

3. **Normal Run**:

   ```bash
   # Start app with existing valid settings
   npm start

   # Check logs - should skip initialization
   ```

### Automated Testing

```typescript
describe("SettingsInitializerService", () => {
  it("should initialize settings on first run", async () => {
    // Clear existing settings
    settingsStore.clear();

    // Initialize
    await settingsInitializerService.initializeSettings();

    // Verify defaults were saved
    const settings = neptuneCoreSettingsService.getAll();
    expect(settings.network.peerPort).toBe(9798);
  });

  it("should skip initialization if valid settings exist", async () => {
    // Initialize once
    await settingsInitializerService.initializeSettings();

    // Try to initialize again
    await settingsInitializerService.initializeSettings();

    // Should log "already initialized"
  });
});
```

---

## Future Enhancements

### Planned Features

1. **Settings Migration**
   - Handle version upgrades
   - Migrate old formats to new
   - Preserve user customizations

2. **Settings Validation**
   - Validate port numbers are available
   - Check data directory permissions
   - Verify peer addresses are valid

3. **Settings Import/Export**
   - Export settings to JSON
   - Import settings from file
   - Share settings across machines

4. **Settings UI**
   - Visual settings editor
   - Real-time validation
   - Tooltips with CLI flag names

---

## Troubleshooting

### Settings Not Initializing

**Symptom**: App starts but settings are missing

**Solution**:

1. Check file permissions on config directory
2. Verify `electron-store` is installed
3. Check logs for initialization errors

### Settings Reset on Every Startup

**Symptom**: Settings always show defaults

**Solution**:

1. Check if settings file is being created
2. Verify file is not being deleted
3. Check for file system permissions

### Initialization Timeout

**Symptom**: App hangs on startup

**Solution**:

1. Check for slow file system operations
2. Verify no deadlocks in initialization
3. Check electron-store performance

---

## Implementation Files

| File                                                      | Purpose                          |
| --------------------------------------------------------- | -------------------------------- |
| `src/main/services/settings-initializer.service.ts`       | Initialization logic             |
| `src/main/services/neptune-core-settings.service.ts`      | Storage & CRUD operations        |
| `src/shared/types/neptune-core-settings.ts`               | TypeScript interfaces & defaults |
| `src/main/ipc/handlers/neptune-core-settings-handlers.ts` | IPC handlers                     |
| `src/preload/api/neptune-core-settings-api.ts`            | Preload API                      |
| `src/main/index.ts`                                       | Initialization hook              |
| `docs/NEPTUNE-CORE-DEFAULTS-MAPPING.md`                   | Comprehensive defaults reference |

---

## Summary

✅ **Automatic initialization** on first run
✅ **Verified defaults** from neptune-core source
✅ **Robust error handling** with fallback
✅ **Persistent storage** with encryption
✅ **Validation** of all categories
✅ **Comprehensive logging** for debugging

The settings initialization system ensures that Neptune Core settings are always available and valid, providing a seamless first-run experience while allowing advanced users to customize their configuration.
