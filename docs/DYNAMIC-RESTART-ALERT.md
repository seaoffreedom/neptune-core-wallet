# Dynamic "Restart Required" Alert

## Feature

The settings sidebar now displays a **dynamic alert** that tracks the complete settings lifecycle: unsaved changes → saved but not applied → applied.

## Implementation

### Location

`src/components/sidebar/SettingsSidebar.tsx` - Information section

### Three States

#### 1. **Restart Required** (needsRestart = true)

```
┌─────────────────────────────────┐
│ ⚠️  Restart Required            │
│                                  │
│ Settings have been saved.       │
│ Restart the app to apply.       │
└─────────────────────────────────┘
```

**Icon:** `AlertCircle` (amber color - `text-amber-500`)
**Title:** "Restart Required"
**Message:** "Settings have been saved. Restart the app to apply changes."
**Priority:** HIGH - Shows after user saves changes

#### 2. **Unsaved Changes** (hasAnyChanges = true, needsRestart = false)

```
┌─────────────────────────────────┐
│ ℹ️  Unsaved Changes             │
│                                  │
│ You have unsaved changes.       │
│ Click "Save Changes" to persist.│
└─────────────────────────────────┘
```

**Icon:** `AlertCircle` (blue color - `text-blue-500`)
**Title:** "Unsaved Changes"
**Message:** "You have unsaved changes. Click 'Save Changes' to persist them."
**Priority:** MEDIUM - Reminds user to save

#### 3. **Up to Date** (hasAnyChanges = false, needsRestart = false)

```
┌─────────────────────────────────┐
│ ✅ Up to Date                   │
│                                  │
│ All settings are saved and      │
│ applied.                        │
└─────────────────────────────────┘
```

**Icon:** `CheckCircle2` (emerald color - `text-emerald-500`)
**Title:** "Up to Date"
**Message:** "All settings are saved and applied."
**Priority:** LOW - Everything is synced

## Implementation Details

### Context Integration

```typescript
import { useSettingsContext } from "@/renderer/context/settings-context";

export function SettingsSidebar() {
    const { hasAnyChanges, dirtyCategories } = useSettingsContext();

    // Dynamic alert rendering
    {hasAnyChanges ? (
        // Show "Restart Required" with unsaved changes details
    ) : (
        // Show "All Changes Saved" confirmation
    )}
}
```

### Dynamic Message Logic

```typescript
// Single category
dirtyCategories.length === 1
  ? dirtyCategories[0] // "network"
  : `${dirtyCategories.length} categories`; // "3 categories"
```

### Visual States

| State   | Icon            | Color                      | Title             | Category Info          |
| ------- | --------------- | -------------------------- | ----------------- | ---------------------- |
| Unsaved | ⚠️ AlertCircle  | Amber (text-amber-500)     | Restart Required  | Shows which categories |
| Saved   | ✅ CheckCircle2 | Emerald (text-emerald-500) | All Changes Saved | Generic message        |

## User Experience Flow

### Scenario 1: Complete Settings Change Lifecycle

```
1. User opens Settings
   Alert: ✅ "Up to Date" (green)

2. User changes Max Peers to 20 in Network settings
   Alert: ℹ️ "Unsaved Changes" (blue)
   SaveChangesBar appears at bottom

3. User navigates to Mining settings (without saving)
   Alert: ℹ️ "Unsaved Changes" (blue) - persists across routes!
   SaveChangesBar still visible

4. User clicks "Save Changes"
   Alert: ⚠️ "Restart Required" (amber) ← NEW STATE!
   SaveChangesBar disappears
   Message: "Settings have been saved. Restart the app to apply changes."

5. User restarts the app
   Alert: ✅ "Up to Date" (green)
```

### Scenario 2: Making More Changes After Saving

```
1. User saves settings
   Alert: ⚠️ "Restart Required" (amber)

2. User makes another change without restarting
   Alert: ℹ️ "Unsaved Changes" (blue) ← Shows unsaved takes priority
   SaveChangesBar appears

3. User saves again
   Alert: ⚠️ "Restart Required" (amber) ← Back to restart warning
```

### Scenario 3: Reset Changes

```
1. User makes changes in multiple categories
   Alert: ℹ️ "Unsaved Changes" (blue)

2. User clicks "Reset"
   Alert: ✅ "Up to Date" (green) ← Reverted to saved state
```

### Scenario 4: Ignoring Changes

```
1. User makes changes
   Alert: ℹ️ "Unsaved Changes" (blue)

2. User navigates away from settings (to Wallet)
   Alert still shows in sidebar when returning to settings

3. User comes back and saves
   Alert: ⚠️ "Restart Required" (amber)
```

## Benefits

### For Users

✅ **Real-time feedback** - Always know if there are unsaved changes
✅ **Clear guidance** - Tells exactly what needs attention
✅ **Visual distinction** - Color-coded states (amber = warning, emerald = success)
✅ **Category tracking** - Shows which categories have changes

### For Developers

✅ **Context-driven** - Uses global settings context
✅ **Reactive** - Updates automatically with state changes
✅ **Consistent** - Uses existing Lucide icons
✅ **Type-safe** - TypeScript integration

## Technical Details

### Icons Used

- `AlertCircle` from lucide-react - Warning state
- `CheckCircle2` from lucide-react - Success state

### Colors

- Amber (`text-amber-500`) - Unsaved changes warning
- Emerald (`text-emerald-500`) - All saved confirmation

### Context Values Used

- `needsRestart: boolean` - Whether saved settings need app restart to apply
- `hasAnyChanges: boolean` - Whether any category has unsaved changes
- `acknowledgeRestart: () => void` - Reset restart flag (called after app restarts)

### State Priority Logic

```typescript
{needsRestart ? (
    // HIGH PRIORITY: Show amber "Restart Required"
    // User has saved changes that need restart
) : hasAnyChanges ? (
    // MEDIUM PRIORITY: Show blue "Unsaved Changes"
    // User has made changes but not saved
) : (
    // LOW PRIORITY: Show green "Up to Date"
    // Everything is saved and applied
)}
```

### State Transitions

```
┌─────────────┐
│  Up to Date │ (initial state)
└──────┬──────┘
       │
       │ User edits a field
       ↓
┌──────────────────┐
│ Unsaved Changes  │
└──────┬───────────┘
       │
       │ User clicks "Save Changes"
       ↓
┌──────────────────┐
│ Restart Required │ ← Persists until app restart!
└──────┬───────────┘
       │
       │ User restarts app
       ↓
┌─────────────┐
│  Up to Date │
└─────────────┘
```

## Future Enhancements

Possible improvements:

1. **List dirty categories** - Click to expand and see which categories
2. **Quick save button** - Add "Save Now" button in the alert
3. **Restart button** - Add "Restart App" button after saving
4. **Time tracking** - Show "Last saved: 2 minutes ago"
5. **Change details** - Show number of fields changed per category

## Testing

### Manual Test Cases

- [ ] No changes → Shows green "All Changes Saved"
- [ ] Change 1 category → Shows amber "Restart Required - network"
- [ ] Change 2 categories → Shows "2 categories"
- [ ] Navigate between routes → Alert persists
- [ ] Save changes → Alert changes to green
- [ ] Reset changes → Alert changes to green
- [ ] Close and reopen app → Alert shows correct state

## Status

✅ **Implemented**
✅ **No Linter Errors**
✅ **Ready for Testing**
