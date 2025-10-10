# Settings Persistence Debugging

## Issue

User reports that many settings are not persisting, particularly in the Advanced category (Tokio Console) and potentially others.

## Root Cause Analysis

### Potential Issues Identified

1. **Optional Field Handling in Forms**
   - Optional fields (`string | undefined`, `number | undefined`) may not be handled correctly in Input components
   - React Hook Form may pass `undefined` to controlled inputs, which can cause issues
   - Need to ensure `value={field.value ?? ""}` for optional string fields
   - Need to ensure `value={field.value ?? ""}` for optional number fields

2. **Optional Fields in Settings Schemas**

   ```typescript
   // These fields are optional:
   - maxConnectionsPerIp?: number
   - txUpgradeFilter?: string
   - guesserThreads?: number
   - maxLog2PaddedHeightForProofs?: number
   - tritonVmEnvVars?: string
   - txProvingCapability?: TxProvingCapability
   - scanBlocks?: string
   - scanKeys?: number
   - dataDir?: string
   - importBlocksFromDirectory?: string
   - blockNotifyCommand?: string
   ```

3. **Service & IPC Layer**
   - Service methods look correct (using spread operator for partial updates)
   - IPC handlers are properly typed with `Partial<T>`
   - Store operations should be working

## Debugging Steps

### 1. Added Console Logging

**In `use-settings-form.ts`:**

```typescript
console.log(`💾 Saving ${category} settings:`, data);
console.log(`✅ Save result for ${category}:`, result);
console.log(`📝 Updated ${category} data:`, updatedCategoryData);
```

**In `neptune-core-settings.service.ts` (Advanced category):**

```typescript
console.log("🔍 Current advanced settings:", current.advanced);
console.log("🔄 Incoming update:", settings);
console.log("✨ Updated advanced settings:", updated.advanced);
console.log("💾 Saved advanced settings:", result.advanced);
```

### 2. Test Procedure

1. Open Advanced Settings
2. Toggle "Tokio Console" to `true`
3. Click "Save Changes"
4. Check console for logs:
   - Should show the form data being sent
   - Should show the IPC result
   - Should show the updated data
5. Navigate away and back
6. Verify setting persisted

### 3. Expected Console Output

```
💾 Saving advanced settings: { tokioConsole: true, blockNotifyCommand: undefined }
🔍 Current advanced settings: { tokioConsole: false, blockNotifyCommand: undefined }
🔄 Incoming update: { tokioConsole: true, blockNotifyCommand: undefined }
✨ Updated advanced settings: { tokioConsole: true, blockNotifyCommand: undefined }
💾 Saved advanced settings: { tokioConsole: true, blockNotifyCommand: undefined }
✅ Save result for advanced: { success: true, settings: { ...all categories... } }
📝 Updated advanced data: { tokioConsole: true, blockNotifyCommand: undefined }
```

## Fixes Applied

### Fix 1: Optional String Input Handling

**Problem:** Input components can't handle `undefined` as a controlled value.

**Solution:** Add `value={field.value ?? ""}` to all optional string inputs.

**Example (blockNotifyCommand):**

```tsx
<Input
  {...field}
  value={field.value ?? ""} // ✅ Convert undefined to empty string
  placeholder="e.g., /path/to/script.sh"
/>
```

### Fix 2: Optional Number Input Handling

**Problem:** Number inputs can't handle `undefined` as a controlled value.

**Solution:** Add `value={field.value ?? ""}` to all optional number inputs.

**Example (guesserThreads):**

```tsx
<Input
  type="number"
  {...field}
  value={field.value ?? ""} // ✅ Convert undefined to empty string
  onChange={(e) =>
    field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)
  }
/>
```

## Files That Need Fixing

### Network Settings Form

- `maxConnectionsPerIp` (number, optional) - NOT CURRENTLY IN FORM

### Mining Settings Form

- `txUpgradeFilter` (string, optional) - ✅ Already handled
- `guesserThreads` (number, optional) - ✅ Already handled with `value={field.value ?? ""}`

### Performance Settings Form

- `maxLog2PaddedHeightForProofs` (number, optional) - ✅ Already handled
- `tritonVmEnvVars` (string, optional) - ⚠️ NEEDS FIX
- `txProvingCapability` (enum, optional) - Uses Select, should be OK

### Security Settings Form

- `scanBlocks` (string, optional) - ⚠️ NEEDS FIX
- `scanKeys` (number, optional) - ✅ Already handled

### Data Settings Form

- `dataDir` (string, optional) - ⚠️ NEEDS FIX
- `importBlocksFromDirectory` (string, optional) - ⚠️ NEEDS FIX

### Advanced Settings Form

- `blockNotifyCommand` (string, optional) - ✅ FIXED

## Verification Checklist

After fixes, test each category:

### Network Settings

- [ ] Change `maxNumPeers` → Save → Reload → Verify
- [ ] Toggle `bootstrap` → Save → Reload → Verify

### Mining Settings

- [ ] Toggle `compose` → Save → Reload → Verify
- [ ] Change `guesserFraction` → Save → Reload → Verify
- [ ] Change `guesserThreads` (optional) → Save → Reload → Verify

### Performance Settings

- [ ] Change `maxNumProofs` → Save → Reload → Verify
- [ ] Change `tritonVmEnvVars` (optional) → Save → Reload → Verify
- [ ] Change `maxLog2PaddedHeightForProofs` (optional) → Save → Reload → Verify

### Security Settings

- [ ] Toggle `disableCookieHint` → Save → Reload → Verify
- [ ] Change `scanBlocks` (optional) → Save → Reload → Verify
- [ ] Change `scanKeys` (optional) → Save → Reload → Verify

### Data Settings

- [ ] Change `dataDir` (optional) → Save → Reload → Verify
- [ ] Change `importBlockFlushPeriod` → Save → Reload → Verify
- [ ] Toggle `disableValidationInBlockImport` → Save → Reload → Verify

### Advanced Settings

- [ ] Toggle `tokioConsole` → Save → Reload → Verify ✅ (with debug logging)
- [ ] Change `blockNotifyCommand` (optional) → Save → Reload → Verify ✅ (fixed)

## Next Steps

1. **Apply fixes to remaining optional string fields**
2. **Test each category systematically**
3. **Check storage file**: `cat ~/.config/neptune-core-wallet/neptune-core-settings.json`
4. **Remove debug logging once verified**
5. **Document any additional issues found**
