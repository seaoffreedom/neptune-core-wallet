# Global Settings State Management - Implemented

## Problem Solved

**Before:** Users could only edit settings within a single category before saving. Navigating to another category would lose changes.

**After:** Users can now edit settings across multiple categories in a single "save session". The SaveChangesBar persists across navigation and saves all changes at once.

## Architecture

### Context-Based State Management

```
Settings Layout (/settings)
├─ SettingsProvider (Context)
│  ├─ Tracks all 6 categories' state
│  ├─ Aggregates dirty status
│  └─ Manages global SaveChangesBar
│
├─ Child Routes (/settings/network, /settings/mining, etc.)
│  ├─ useSettingsForm (local form management)
│  └─ Registers state with global context
│
└─ Global SaveChangesBar (at layout level)
   ├─ Shows when ANY category is dirty
   ├─ Displays total change count
   └─ Saves ALL dirty categories
```

## User Flow

### Example Workflow

```
1. User navigates to Settings → Network
   - Changes "Max Peers" to 20
   - SaveChangesBar appears: "1 change"

2. User navigates to Settings → Mining
   - Network changes PERSIST (bar still visible!)
   - Changes "Compose" to enabled
   - SaveChangesBar updates: "2 changes"

3. User navigates to Settings → Performance
   - Previous changes PERSIST (bar still visible!)
   - Changes "Max Proofs" to 32
   - SaveChangesBar updates: "3 changes"

4. User clicks "Save Changes"
   - All 3 categories save in parallel
   - Settings persist to electron-store
   - SaveChangesBar slides down
   - Success!

5. User navigates between categories
   - All changes are saved and persisted
   - No SaveChangesBar (no pending changes)
```

## Implementation Details

### 1. Settings Context (`src/renderer/context/settings-context.tsx`)

**Responsibilities:**

- Maintains state for all 6 categories
- Tracks isDirty, dirtyCount, handleSave, handleReset for each
- Provides global aggregated state (hasAnyChanges, totalChangeCount)
- Implements saveAllChanges() - saves all dirty categories in parallel
- Implements resetAllChanges() - resets all dirty categories

**Key Methods:**

```typescript
// Register a category's state (called by useSettingsForm)
registerCategory(category, { isDirty, dirtyCount, handleSave, handleReset });

// Save all dirty categories
await saveAllChanges(); // Calls handleSave() for each dirty category

// Reset all dirty categories
resetAllChanges(); // Calls handleReset() for each dirty category
```

### 2. Updated useSettingsForm Hook

**New Behavior:**

- Still manages local form state with react-hook-form
- **NEW:** Registers state with global context via useEffect
- Unregisters on unmount (cleanup)

**Registration Code:**

```typescript
useEffect(() => {
  registerCategory(category, {
    isDirty,
    dirtyCount,
    form,
    handleSave,
    handleReset,
  });

  return () => {
    unregisterCategory(category);
  };
}, [category, isDirty, dirtyCount, handleSave, handleReset]);
```

### 3. Settings Layout Route (`src/routes/settings.tsx`)

**Structure:**

```typescript
<SettingsProvider>
  <SettingsContent>
    <Outlet /> {/* Child routes render here */}

    {/* Global SaveChangesBar */}
    <SaveChangesBar
      isVisible={hasAnyChanges}  // True if ANY category is dirty
      changeCount={totalChangeCount}  // Sum of all dirty fields
      onSave={saveAllChanges}  // Saves ALL dirty categories
      onReset={resetAllChanges}  // Resets ALL dirty categories
    />
  </SettingsContent>
</SettingsProvider>
```

### 4. Individual Route Changes

**Before (Per-Category State):**

```typescript
function NetworkSettings() {
    const { form, isDirty, handleSave, handleReset, isSaving } = useSettingsForm(...);

    return (
        <>
            <PageContainer>
                <NetworkSettingsForm form={form} />
            </PageContainer>
            <SaveChangesBar ... /> {/* ❌ Per-route bar */}
        </>
    );
}
```

**After (Global State):**

```typescript
function NetworkSettings() {
    const { form, isLoading } = useSettingsForm(...);  // ✅ Simplified
    const { hasAnyChanges } = useSettingsContext();  // ✅ Global state

    return (
        <PageContainer>
            <div className={hasAnyChanges ? "pb-20" : ""}>  {/* ✅ Dynamic padding */}
                <NetworkSettingsForm form={form} />
            </div>
        </PageContainer>
        // ✅ No SaveChangesBar here - it's in the layout!
    );
}
```

## Benefits

### User Experience

✅ Can edit multiple categories before saving
✅ Changes persist when navigating between categories
✅ Single "Save Changes" button for all changes
✅ Clear indication of total pending changes
✅ More intuitive workflow

### Technical

✅ Single source of truth for dirty state
✅ Parallel saves (faster)
✅ Automatic cleanup on unmount
✅ Type-safe with TypeScript
✅ No prop drilling
✅ Clean separation of concerns

## Files Changed

### New Files

- `src/renderer/context/settings-context.tsx` (194 lines) - Global context

### Modified Files

- `src/renderer/hooks/use-settings-form.ts` - Added context registration
- `src/routes/settings.tsx` - Added provider and global SaveChangesBar
- `src/routes/settings/network.tsx` - Simplified (removed local SaveChangesBar)
- `src/routes/settings/mining.tsx` - Simplified
- `src/routes/settings/performance.tsx` - Simplified
- `src/routes/settings/security.tsx` - Simplified
- `src/routes/settings/data.tsx` - Simplified
- `src/routes/settings/advanced.tsx` - Simplified

## Testing Checklist

### Basic Flow

- [ ] Navigate to Network → Change setting → Bar appears
- [ ] Navigate to Mining → Bar persists, change setting → Count updates
- [ ] Navigate to Performance → Bar persists, change setting → Count updates
- [ ] Click "Save Changes" → All categories save successfully
- [ ] Navigate between categories → All changes persisted

### Edge Cases

- [ ] Navigate to category with no changes → No bar
- [ ] Make changes → Navigate away → Navigate back → Changes still dirty
- [ ] Reset button → All dirty categories reset
- [ ] Mix of dirty and clean categories → Only dirty ones save
- [ ] Reload app → All saved changes persisted

### Performance

- [ ] Parallel saves complete quickly
- [ ] No unnecessary re-renders
- [ ] Context updates efficiently

## Console Output

Expected logs when saving across multiple categories:

```
💾 Saving all dirty categories: ["network", "mining", "performance"]
💾 Saving network settings: { maxNumPeers: 20, ... }
💾 Saving mining settings: { compose: true, ... }
💾 Saving performance settings: { maxNumProofs: 32, ... }
✅ Save result for network: { success: true, ... }
✅ Save result for mining: { success: true, ... }
✅ Save result for performance: { success: true, ... }
✅ All categories saved successfully
```

## Status

✅ **Implementation Complete**
✅ **No Linter Errors**
✅ **Ready for Testing**

## Next Steps

1. Test the multi-category save workflow
2. Verify all categories save correctly
3. Confirm changes persist after reload
4. Remove debug logging (optional)
5. Proceed to Phase 4: CLI Integration
