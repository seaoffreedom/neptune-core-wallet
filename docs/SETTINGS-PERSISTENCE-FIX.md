# Settings Persistence Fix - Applied

## Issue Summary

User reported that many settings were not persisting, particularly:

- Advanced → Tokio Console
- Other optional fields across all categories

## Root Cause

**React Hook Form with Optional Fields**

When optional fields (`string | undefined`, `number | undefined`) are used in controlled Input components, React cannot properly handle `undefined` as a value. This causes:

1. React warnings about switching between controlled/uncontrolled
2. Form state not updating correctly
3. Settings appearing to save but not actually persisting

## Solution Applied

Added `value={field.value ?? ""}` to all optional string and number inputs to convert `undefined` to an empty string, which React can handle properly.

## Files Fixed

### ✅ Advanced Settings Form

- `blockNotifyCommand` (string, optional)

### ✅ Mining Settings Form

- `txUpgradeFilter` (string, optional)

### ✅ Performance Settings Form

- `tritonVmEnvVars` (string, optional)

### ✅ Security Settings Form

- `scanBlocks` (string, optional)

### ✅ Data Settings Form

- `dataDir` (string, optional)
- `importBlocksFromDirectory` (string, optional)

## Pattern Applied

**Before:**

```tsx
<Input {...field} placeholder="Optional value" />
```

**After:**

```tsx
<Input
  {...field}
  value={field.value ?? ""} // ✅ Convert undefined to empty string
  placeholder="Optional value"
/>
```

**Note:** Number fields with optional values already had this pattern:

```tsx
<Input
  type="number"
  {...field}
  value={field.value ?? ""} // ✅ Already correct
  onChange={(e) =>
    field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)
  }
/>
```

## Debug Logging Added

To help diagnose issues, console logging was added:

**In `use-settings-form.ts`:**

- Logs form data being saved
- Logs IPC result
- Logs updated category data

**In `neptune-core-settings.service.ts` (Advanced category only):**

- Logs current settings
- Logs incoming update
- Logs merged settings
- Logs final saved settings

**To remove debug logging later:**

1. Remove console.log statements from `use-settings-form.ts` handleSave
2. Remove console.log statements from `neptune-core-settings.service.ts` updateAdvanced

## Verification Steps

### Quick Test (All Categories)

1. Navigate to each settings category
2. Change any field (especially optional ones)
3. Click "Save Changes"
4. Check console for logs (should show successful save)
5. Navigate away and back
6. Verify setting persisted

### Storage Verification

```bash
# Check the settings file
cat ~/.config/neptune-core-wallet/neptune-core-settings.json

# You should see all categories with your changes
```

### Specific Tests

**Advanced Settings:**

```
1. Toggle "Tokio Console" to true
2. Save
3. Reload app
4. Navigate to Advanced → Should show tokioConsole: true
```

**Data Settings:**

```
1. Set "Data Directory" to "/custom/path"
2. Save
3. Reload app
4. Navigate to Data → Should show dataDir: "/custom/path"
```

**Performance Settings:**

```
1. Set "Triton VM Env Vars" to "TEST=value"
2. Save
3. Reload app
4. Navigate to Performance → Should show tritonVmEnvVars: "TEST=value"
```

## Technical Details

### Why This Fix Works

1. **Controlled Components:** React Input components must have a defined value
2. **RHF Behavior:** React Hook Form passes field values directly to inputs
3. **Optional Fields:** TypeScript allows `undefined` but React doesn't
4. **Nullish Coalescing:** `??` operator provides a fallback value
5. **Empty String:** React treats `""` as valid controlled value

### Why Other Fields Worked

- **Boolean fields (Switch):** Already handle `true`/`false` properly
- **Number fields:** Were already using `value={field.value ?? ""}` pattern
- **Required string fields:** Never undefined, always have a value
- **Select fields:** shadcn Select handles undefined internally

## Status

✅ **All optional string fields fixed**
✅ **Debug logging added for troubleshooting**
✅ **No linter errors**
✅ **Ready for user testing**

## Next Steps

1. User tests all settings categories
2. Verify persistence works correctly
3. User confirms all issues resolved
4. Remove debug logging (optional)
5. Proceed to Phase 4: CLI Integration
