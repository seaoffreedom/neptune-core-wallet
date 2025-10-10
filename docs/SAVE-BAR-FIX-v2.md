# SaveChangesBar State Management - Fix v2

## Issue After First Fix

After fixing the unregister issue, the SaveChangesBar now **persists across navigation** ✅, but it **doesn't disappear after saving** ❌.

## Root Cause

The `saveAllChanges` function was capturing `dirtyCategories` in its closure at function creation time. When categories were saved and their forms reset (setting `isDirty = false`), the function still had the old list.

## The Fix

### Before (Stale Closure):

```typescript
const saveAllChanges = useCallback(async () => {
  // Uses dirtyCategories from closure - stale data!
  const savePromises = dirtyCategories.map((category) => {
    const state = categories[category];
    if (state.handleSave) {
      return state.handleSave();
    }
    return Promise.resolve();
  });
  await Promise.all(savePromises);
}, [categories, dirtyCategories]); // ← dirtyCategories in deps causes stale closure
```

### After (Fresh State):

```typescript
const saveAllChanges = useCallback(async () => {
  // Get FRESH list of dirty categories at save time
  const categoriesToSave = Object.entries(categories)
    .filter(([_, state]) => state.isDirty && state.handleSave)
    .map(([cat]) => cat as SettingsCategory);

  const savePromises = categoriesToSave.map((category) => {
    const state = categories[category];
    if (state.handleSave) {
      return state.handleSave();
    }
    return Promise.resolve();
  });
  await Promise.all(savePromises);
}, [categories]); // ← Only categories in deps, compute dirty list fresh each time
```

## How It Works Now

### Save Flow:

1. **User clicks "Save Changes"**

   ```
   Global Context: hasAnyChanges = true, dirtyCategories = ["network", "mining"]
   ```

2. **saveAllChanges() called**

   ```
   → Computes FRESH list: ["network", "mining"]
   → Calls handleSave() for each in parallel
   ```

3. **Each handleSave() completes**

   ```
   Network: reset() → isDirty = false
   Mining: reset() → isDirty = false
   ```

4. **useEffect in useSettingsForm triggers**

   ```
   → registerCategory("network", { isDirty: false, ... })
   → registerCategory("mining", { isDirty: false, ... })
   ```

5. **Context state updates**
   ```
   Global Context: hasAnyChanges = false (no dirty categories)
   → SaveChangesBar visibility = false
   → Bar slides down! ✅
   ```

## Debug Logging Added

### Registration Logging:

```
📝 Registering network: { isDirty: true, dirtyCount: 1 }
🔄 Updated categories state: {
  category: 'network',
  newState: { isDirty: true, dirtyCount: 1, ... },
  allDirty: ['network']
}
```

### After Save:

```
💾 Saving all dirty categories: ['network', 'mining']
💾 Saving network settings: { maxNumPeers: 20, ... }
💾 Saving mining settings: { compose: true, ... }
✅ Save result for network: { success: true, ... }
✅ Save result for mining: { success: true, ... }
✅ All categories saved successfully
📝 Registering network: { isDirty: false, dirtyCount: 0 }
🔄 Updated categories state: { ..., allDirty: ['mining'] }
📝 Registering mining: { isDirty: false, dirtyCount: 0 }
🔄 Updated categories state: { ..., allDirty: [] }
```

**Key:** Watch for `allDirty: []` - that's when the bar should disappear!

## Testing Checklist

### Scenario 1: Single Category

- [ ] Change Network setting → Bar appears
- [ ] Click "Save" → Bar disappears after save ✅
- [ ] Setting persists

### Scenario 2: Multiple Categories

- [ ] Change Network setting → Bar shows "1 change"
- [ ] Navigate to Mining → Bar stays with "1 change"
- [ ] Change Mining setting → Bar updates to "2 changes"
- [ ] Click "Save" → Both save, bar disappears ✅
- [ ] Both settings persist

### Scenario 3: Reset Flow

- [ ] Change multiple settings across categories
- [ ] Click "Reset" → All revert, bar disappears ✅

### Scenario 4: Navigation After Save

- [ ] Save changes
- [ ] Navigate between categories
- [ ] Bar stays hidden (no phantom dirty state)

## Console Output to Expect

### Making Changes:

```
📝 Registering network: { isDirty: true, dirtyCount: 1 }
🔄 Updated categories state: { allDirty: ['network'] }
```

### Navigating:

```
📝 Registering mining: { isDirty: false, dirtyCount: 0 }
🔄 Updated categories state: { allDirty: ['network'] }
```

_Note: network stays dirty!_

### Saving:

```
💾 Saving all dirty categories: ['network']
💾 Saving network settings: { ... }
✅ Save result for network: { success: true }
✅ All categories saved successfully
📝 Registering network: { isDirty: false, dirtyCount: 0 }
🔄 Updated categories state: { allDirty: [] }
```

_Note: allDirty becomes empty, bar should disappear!_

## Status

✅ Unregister preserves dirty state (Fixed in v1)
✅ Save uses fresh category list (Fixed in v2)
✅ Detailed debug logging added
✅ No linter errors

**Next:** Test and verify bar disappears after save!
