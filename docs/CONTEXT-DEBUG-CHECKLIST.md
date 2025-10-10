# Settings Context Debugging Checklist

## Issue

SaveChangesBar still disappears when navigating between settings sub-routes, even after implementing global context.

## Debugging Steps

### 1. Check Console for Registration Logs

When you navigate to a settings page, you should see:

```
📝 Registering network: { isDirty: false, dirtyCount: 0 }
```

**If you DON'T see this:** The context isn't being registered properly.

### 2. Check Console for Form Changes

When you change a setting, you should see:

```
📝 Registering network: { isDirty: true, dirtyCount: 1 }
```

**If the isDirty stays false:** The form isn't detecting changes.

### 3. Check Browser DevTools React Components

1. Open DevTools → Components tab
2. Navigate to settings route
3. Look for `SettingsProvider` in the component tree
4. It should wrap all settings routes

**If SettingsProvider is missing:** The context isn't wrapping the routes.

### 4. Check Route Hierarchy

Expected structure in DevTools:

```
<SettingsProvider>
  <SettingsContent>
    <Outlet>
      <NetworkSettings>  ← Current route
        <PageContainer>
          <NetworkSettingsForm>
```

### 5. Verify Context Hook Usage

In NetworkSettings component, check if:

- `useSettingsContext()` is being called
- `hasAnyChanges` value is available
- No error about "must be used within SettingsProvider"

### 6. Check for Multiple Renders

If the component re-renders excessively:

- Look for infinite loops in console
- Check if useEffect dependencies are correct

## Common Issues

### Issue 1: Context Not Wrapping Routes

**Symptom:** Error: "useSettingsContext must be used within SettingsProvider"

**Solution:** Ensure `settings.tsx` (layout route) has the Provider:

```tsx
<SettingsProvider>
  <SettingsContent />
</SettingsProvider>
```

### Issue 2: Routes Not Using Context

**Symptom:** SaveChangesBar still disappears

**Solution:** Ensure each route imports and uses the context:

```tsx
import { useSettingsContext } from "@/renderer/context/settings-context";

function NetworkSettings() {
  const { hasAnyChanges } = useSettingsContext();
  // ...
}
```

### Issue 3: Registration Not Happening

**Symptom:** No registration logs in console

**Solution:** Check `useSettingsForm` hook has the useEffect:

```tsx
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

### Issue 4: TanStack Router Not Recognizing Layout

**Symptom:** Routes render but context doesn't work

**Solution:** Ensure file structure is correct:

```
src/routes/
├── settings.tsx          ← Layout route with Provider
└── settings/
    ├── index.tsx         ← Overview page
    ├── network.tsx       ← Network settings
    ├── mining.tsx        ← Mining settings
    └── ...
```

## Manual Test

1. **Navigate to /settings/network**
   - Open DevTools Console
   - Change "Max Peers" to 20
   - Expected: Bar appears with "1 change"
   - Check console for: `📝 Registering network: { isDirty: true, dirtyCount: 1 }`

2. **Navigate to /settings/mining** (WITHOUT saving)
   - Expected: Bar STAYS VISIBLE
   - Expected: "1 change" still showing
   - Check console for: `📝 Registering mining: { isDirty: false, dirtyCount: 0 }`

3. **Change "Compose" to enabled**
   - Expected: Bar updates to "2 changes"
   - Check console for: `📝 Registering mining: { isDirty: true, dirtyCount: 1 }`

## If Still Not Working

### Temporary Workaround: Check if Context is Available

Add to NetworkSettings:

```tsx
function NetworkSettings() {
  try {
    const context = useSettingsContext();
    console.log("✅ Context available:", context);
  } catch (error) {
    console.error("❌ Context not available:", error);
  }
  // ...
}
```

### Check Provider Render

Add to SettingsProvider:

```tsx
export function SettingsProvider({ children }: { children: ReactNode }) {
  console.log("🔧 SettingsProvider rendering");
  // ...
}
```

### Check Layout Render

Add to SettingsLayout:

```tsx
function SettingsLayout() {
  console.log("🏗️ SettingsLayout rendering");
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
}
```

## Expected Console Output for Full Flow

```
🏗️ SettingsLayout rendering
🔧 SettingsProvider rendering
📝 Registering network: { isDirty: false, dirtyCount: 0 }
[User changes Max Peers]
📝 Registering network: { isDirty: true, dirtyCount: 1 }
[User navigates to Mining]
📝 Registering network: { isDirty: true, dirtyCount: 1 }
📝 Registering mining: { isDirty: false, dirtyCount: 0 }
[User changes Compose]
📝 Registering mining: { isDirty: true, dirtyCount: 1 }
[Bar should show "2 changes"]
```

## Next Steps

1. Open DevTools Console
2. Navigate to /settings/network
3. Check for registration logs
4. Report back what you see!
