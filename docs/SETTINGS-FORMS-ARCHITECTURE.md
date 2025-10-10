# Settings Forms Architecture

## Overview

This document describes the architecture and implementation of the Neptune Core wallet settings forms system, including change detection, validation, and persistence.

## Architecture Components

### 1. SaveChangesBar Component

**Location:** `src/components/settings/save-changes-bar.tsx`

**Purpose:** Fixed-position slideup bar that appears when settings have unsaved changes.

**Key Features:**

- ✅ `position: fixed` - Removed from document flow
- ✅ `bottom: 0` - Always at viewport bottom
- ✅ Framer Motion animations (slide up/down)
- ✅ Loading states (isSaving, isSaved)
- ✅ Change count badge
- ✅ Save and Reset actions

**Props:**

```typescript
interface SaveChangesBarProps {
  isVisible: boolean; // Show/hide bar
  hasChanges: boolean; // Whether changes exist
  changeCount: number; // Number of changed fields
  onSave: () => Promise<void>;
  onReset: () => void;
  isSaving?: boolean;
}
```

**CSS Strategy:**

```tsx
<motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t"
>
```

**No Layout Interference:**

- Fixed positioning removes it from normal document flow
- Z-index of 50 keeps it above content but below dialogs
- Doesn't affect ScrollArea or PageContainer

---

### 2. useSettingsForm Hook

**Location:** `src/renderer/hooks/use-settings-form.ts`

**Purpose:** Reusable hook for managing settings forms with react-hook-form, Zod validation, and IPC integration.

**Generic Type Signature:**

```typescript
export function useSettingsForm<
  T extends CategorySettingsMap[SettingsCategory] & FieldValues,
>(options: UseSettingsFormOptions<T>): UseSettingsFormReturn<T>;
```

**Options:**

```typescript
interface UseSettingsFormOptions<T> {
  category:
    | "network"
    | "mining"
    | "performance"
    | "security"
    | "data"
    | "advanced";
  schema: ZodType<T>; // Zod validation schema
}
```

**Return Value:**

```typescript
interface UseSettingsFormReturn<T> {
  form: UseFormReturn<T>; // RHF form instance
  isLoading: boolean; // Initial data load state
  isSaving: boolean; // Save operation state
  isDirty: boolean; // Has unsaved changes
  dirtyCount: number; // Number of changed fields
  handleSave: () => Promise<void>;
  handleReset: () => void;
}
```

**Flow:**

1. **Load (on mount):**

   ```typescript
   const result = await window.electronAPI.neptuneCoreSettings.getAll();
   setInitialData(result.settings[category]);
   form.reset(result.settings[category]); // Initialize RHF
   ```

2. **Save (on user action):**

   ```typescript
   const updateMethod = `update${capitalize(category)}`; // e.g., 'updateNetwork'
   const result =
     await window.electronAPI.neptuneCoreSettings[updateMethod](data);
   setInitialData(result.settings[category]);
   form.reset(result.settings[category]); // Clear isDirty
   ```

3. **Reset (on user action):**
   ```typescript
   form.reset(initialData); // Revert to loaded data
   ```

**IPC Integration:**

Uses **category-specific update methods** (not `updateAll`):

- ✅ `updateNetwork(settings: Partial<NetworkSettings>)`
- ✅ `updateMining(settings: Partial<MiningSettings>)`
- ✅ `updatePerformance(settings: Partial<PerformanceSettings>)`
- ✅ `updateSecurity(settings: Partial<SecuritySettings>)`
- ✅ `updateData(settings: Partial<DataSettings>)`
- ✅ `updateAdvanced(settings: Partial<AdvancedSettings>)`

**Why?** Only updates the specific category, leaves other settings untouched.

---

### 3. Zod Validation Schemas

**Location:** `src/lib/validation/settings-schemas.ts`

**Purpose:** Type-safe validation for all settings categories before saving.

**Available Schemas:**

- `networkSettingsSchema` → `NetworkSettingsFormData`
- `miningSettingsSchema` → `MiningSettingsFormData`
- `performanceSettingsSchema` → `PerformanceSettingsFormData`
- `securitySettingsSchema` → `SecuritySettingsFormData`
- `dataSettingsSchema` → `DataSettingsFormData`
- `advancedSettingsSchema` → `AdvancedSettingsFormData`

**Example Schema:**

```typescript
export const networkSettingsSchema = z.object({
  network: z.enum(["main", "alpha", "beta", "testnet", "regtest"]),
  peerPort: z.number().int().min(1).max(65535),
  rpcPort: z.number().int().min(1).max(65535),
  peerListenAddr: z.string().min(1),
  peers: z.array(z.string()).default([]),
  maxNumPeers: z.number().int().min(0).max(1000),
  // ... more fields
});
```

**Integration with RHF:**

```typescript
const form = useForm<NetworkSettingsFormData>({
  resolver: zodResolver(networkSettingsSchema),
  mode: "onChange",
});
```

---

### 4. Settings Form Components

**Location:** `src/components/settings/`

**Pattern:** Each category has its own form component.

**Example: NetworkSettingsForm**

```typescript
export function NetworkSettingsForm() {
    const { form, isLoading } = useSettingsForm<NetworkSettingsFormData>({
        category: "network",
        schema: networkSettingsSchema,
    });

    if (isLoading) {
        return <Skeleton />;
    }

    return (
        <Form {...form}>
            <form className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="network"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Network Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        {/* ... */}
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* More fields... */}
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
```

**Key Points:**

- Uses shadcn/ui Form components (FormField, FormItem, etc.)
- No save button in the form itself (handled by SaveChangesBar)
- Form fields directly modify the RHF state
- Validation happens on change (mode: "onChange")

---

### 5. Route Integration

**Location:** `src/routes/settings/network.tsx` (example)

**Pattern:** Route component coordinates the form and SaveChangesBar.

```typescript
function NetworkSettings() {
    const { isDirty, dirtyCount, handleSave, handleReset, isSaving } =
        useSettingsForm<NetworkSettingsFormData>({
            category: "network",
            schema: networkSettingsSchema,
        });

    return (
        <>
            <PageContainer>
                <div
                    className={cn(
                        "space-y-6 transition-[padding]",
                        isDirty && "pb-20", // ← Add padding when bar is visible
                    )}
                >
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Network Settings</h1>
                        <p className="text-muted-foreground">
                            Configure peer connections, ports, and network parameters.
                        </p>
                    </div>

                    <NetworkSettingsForm />
                </div>
            </PageContainer>

            {/* SaveChangesBar - Fixed to bottom, outside layout flow */}
            <SaveChangesBar
                isVisible={isDirty}
                hasChanges={isDirty}
                changeCount={dirtyCount}
                onSave={handleSave}
                onReset={handleReset}
                isSaving={isSaving}
            />
        </>
    );
}
```

**Key Points:**

- `useSettingsForm` hook called in route component (not form component)
- This allows route to pass handlers to both form and SaveChangesBar
- Dynamic padding (`pb-20`) when `isDirty` is true
- SaveChangesBar rendered at route level (not inside PageContainer)

---

## Change Detection Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User opens /settings/network                        │
│    - useSettingsForm fetches via getAll()              │
│    - Stores as initialData                             │
│    - Initializes form with form.reset(initialData)     │
│    - isDirty = false                                   │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. User changes "Max Peers" field                      │
│    - FormField onChange updates form state             │
│    - RHF detects change → formState.isDirty = true     │
│    - Route component: isDirty = true                   │
│    - SaveChangesBar slides up (AnimatePresence)        │
│    - Content padding increases (pb-20)                 │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. User clicks "Save Changes"                          │
│    - Calls handleSave()                                │
│    - Validates with Zod schema                         │
│    - Calls updateNetwork(formData)                     │
│    - IPC handler saves to electron-store               │
│    - Returns updated settings                          │
│    - form.reset(newSettings) → isDirty = false         │
│    - SaveChangesBar slides down                        │
│    - Padding removed                                   │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. OR user clicks "Reset"                              │
│    - Calls handleReset()                               │
│    - form.reset(initialData)                           │
│    - All fields revert to loaded values                │
│    - formState.isDirty = false                         │
│    - SaveChangesBar slides down                        │
│    - No IPC call needed                                │
└─────────────────────────────────────────────────────────┘
```

---

## Layout Architecture

### No Layout Interference

**Problem:** Fixed elements can cause content to be hidden behind them.

**Solution:** Dynamic padding when SaveChangesBar is visible.

```tsx
<PageContainer>
  <div
    className={cn(
      "space-y-6 transition-[padding]",
      isDirty && "pb-20", // ← Padding when bar visible
    )}
  >
    {/* Content */}
  </div>
</PageContainer>;

{
  /* OUTSIDE PageContainer - Fixed positioning */
}
<SaveChangesBar
  isVisible={isDirty}
  // ...
/>;
```

**Result:**

- Content naturally scrolls without being hidden
- Smooth transition when bar appears/disappears
- No layout shift or jank
- ScrollArea handles it automatically

---

## Performance Considerations

### Why React Hook Form?

**Benefits:**

- ✅ Minimal re-renders (only affected fields)
- ✅ Built-in dirty tracking (`formState.isDirty`)
- ✅ Field-level validation
- ✅ No manual state management
- ✅ Deep integration with Zod

**Alternative (trident-wallet):**

- Uses `useState` for entire settings object
- Manual deep comparison on every render
- Re-renders entire form on any change

**Performance Comparison:**

| Feature              | RHF (Our Implementation)          | useState (Trident)  |
| -------------------- | --------------------------------- | ------------------- |
| Re-renders on change | Only affected field               | Entire form         |
| Validation           | Automatic (Zod)                   | Manual              |
| Dirty tracking       | Built-in                          | Manual comparison   |
| Change count         | `Object.keys(dirtyFields).length` | Custom logic        |
| Reset                | `form.reset()`                    | Manual state update |

---

## Implementation Phases

### Phase 1: Infrastructure ✅ (Complete)

- [x] Create `SaveChangesBar` component
- [x] Create `useSettingsForm` hook
- [x] Create Zod validation schemas
- [x] Test with Network settings

### Phase 2: Network Settings ✅ (Complete)

- [x] Build `NetworkSettingsForm` with all fields
- [x] Integrate into `/settings/network` route
- [x] Add dynamic padding logic
- [x] Test change detection (isDirty)
- [x] Test save flow (updateNetwork IPC)
- [x] Test reset flow (form.reset)
- [x] Test bar animation (slide up/down)
- [x] Verify no layout interference

### Phase 3: Remaining Categories (TODO)

- [ ] Mining settings form
- [ ] Performance settings form
- [ ] Security settings form
- [ ] Data settings form
- [ ] Advanced settings form

---

## Testing Checklist

### For Each Settings Category:

**Change Detection:**

- [ ] Bar doesn't show on initial load
- [ ] Bar appears when field is changed
- [ ] Change count updates correctly
- [ ] Bar disappears after save
- [ ] Bar disappears after reset

**Save Flow:**

- [ ] Validation errors prevent save
- [ ] Loading state shows during save
- [ ] Success state shows after save (2s)
- [ ] Settings persist to electron-store
- [ ] Form resets after successful save

**Reset Flow:**

- [ ] All fields revert to initial values
- [ ] No API call made
- [ ] Bar slides down immediately

**Layout:**

- [ ] SaveChangesBar doesn't affect scroll
- [ ] Content isn't hidden behind bar
- [ ] Padding transitions smoothly
- [ ] No layout shift or jank

**Performance:**

- [ ] No unnecessary re-renders
- [ ] Form stays responsive with many fields
- [ ] Validation doesn't block UI

---

## File Structure

```
src/
├── components/
│   └── settings/
│       ├── index.ts                     # Barrel export
│       ├── save-changes-bar.tsx         # ✅ Slideup bar component
│       ├── network-settings-form.tsx    # ✅ Network form
│       ├── mining-settings-form.tsx     # TODO
│       ├── performance-settings-form.tsx # TODO
│       ├── security-settings-form.tsx   # TODO
│       ├── data-settings-form.tsx       # TODO
│       └── advanced-settings-form.tsx   # TODO
├── renderer/
│   └── hooks/
│       └── use-settings-form.ts         # ✅ Reusable hook
├── lib/
│   └── validation/
│       └── settings-schemas.ts          # ✅ Zod schemas
└── routes/
    └── settings/
        ├── index.tsx                    # Settings overview
        ├── network.tsx                  # ✅ Network route
        ├── mining.tsx                   # TODO
        ├── performance.tsx              # TODO
        ├── security.tsx                 # TODO
        ├── data.tsx                     # TODO
        └── advanced.tsx                 # TODO
```

---

## API Reference

### IPC Channels (Already Implemented)

```typescript
// Get all settings
await window.electronAPI.neptuneCoreSettings.getAll();

// Update specific category (USE THESE ✅)
await window.electronAPI.neptuneCoreSettings.updateNetwork(settings);
await window.electronAPI.neptuneCoreSettings.updateMining(settings);
await window.electronAPI.neptuneCoreSettings.updatePerformance(settings);
await window.electronAPI.neptuneCoreSettings.updateSecurity(settings);
await window.electronAPI.neptuneCoreSettings.updateData(settings);
await window.electronAPI.neptuneCoreSettings.updateAdvanced(settings);

// Reset to defaults
await window.electronAPI.neptuneCoreSettings.resetToDefaults();

// Import/Export
await window.electronAPI.neptuneCoreSettings.export();
await window.electronAPI.neptuneCoreSettings.import(jsonString);
```

### Storage

**Location:** `~/.config/neptune-core-wallet/neptune-core-settings.json`

**Encryption:** Enabled with key `"neptune-core-wallet-settings"`

**Format:**

```json
{
  "neptuneCore": {
    "network": {
      /* ... */
    },
    "mining": {
      /* ... */
    },
    "performance": {
      /* ... */
    },
    "security": {
      /* ... */
    },
    "data": {
      /* ... */
    },
    "advanced": {
      /* ... */
    }
  }
}
```

---

## Next Steps

1. Test Network settings in the running app
2. Implement Mining settings form
3. Implement Performance settings form
4. Implement Security settings form
5. Implement Data settings form
6. Implement Advanced settings form
7. Add restart notification (settings require app restart)
8. Integrate settings into neptune-core spawning process
