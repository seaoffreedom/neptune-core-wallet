# Toast Utility Usage Guide

App-wide toast notification system using [Sonner](https://sonner.emilkowal.ski/) via [shadcn/ui](https://ui.shadcn.com/docs/components/sonner).

## Overview

The toast utility provides a consistent way to show notifications across the application. All toasts are displayed using the Sonner component, which provides:

- Beautiful, accessible toast notifications
- Automatic stacking and queueing
- Promise-based loading states
- Theme-aware styling
- Smooth animations

## Import

```typescript
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showToast,
  showLoadingToast,
  showPromiseToast,
  dismissToast,
  dismissAllToasts,
  toast // Raw sonner toast for advanced usage
} from '@/lib/toast';
```

## Basic Usage

### Success Toast

```typescript
showSuccessToast('Settings saved successfully!');

// With description
showSuccessToast('Settings saved!', {
  description: 'Your changes have been applied to Neptune Core.',
});

// With action button
showSuccessToast('Transaction sent!', {
  description: 'Your transaction has been broadcast to the network.',
  action: {
    label: 'View',
    onClick: () => console.log('View transaction'),
  },
});

// Custom duration (in milliseconds)
showSuccessToast('Copied to clipboard', {
  duration: 2000,
});
```

### Error Toast

```typescript
showErrorToast('Failed to save settings');

// With description
showErrorToast('Connection failed', {
  description: 'Unable to connect to Neptune Core. Please check if it\'s running.',
});

// With retry action
showErrorToast('Transaction failed', {
  description: 'Insufficient funds for transaction.',
  action: {
    label: 'Retry',
    onClick: () => console.log('Retry transaction'),
  },
});
```

### Warning Toast

```typescript
showWarningToast('Unsaved changes');

showWarningToast('Low balance', {
  description: 'Your balance is running low. Consider receiving funds.',
});
```

### Info Toast

```typescript
showInfoToast('Syncing blockchain data...');

showInfoToast('New version available', {
  description: 'Version 2.0.0 is ready to install.',
  action: {
    label: 'Update',
    onClick: () => console.log('Update app'),
  },
});
```

### Default Toast

```typescript
showToast('Event occurred');

showToast('Event has been created', {
  description: 'Sunday, December 03, 2023 at 9:00 AM',
});
```

## Advanced Usage

### Loading Toast

For long-running operations, show a loading toast:

```typescript
// Show loading toast
const toastId = showLoadingToast('Processing transaction...');

// Later, dismiss it
dismissToast(toastId);

// Or update it to success
showSuccessToast('Transaction completed!');
```

### Promise Toast

Automatically show loading, success, or error states:

```typescript
showPromiseToast(
  async () => {
    const result = await window.electronAPI.neptuneCoreSettings.updateAll(settings);
    if (!result.success) throw new Error(result.error);
    return result.settings;
  },
  {
    loading: 'Saving settings...',
    success: 'Settings saved successfully!',
    error: (err) => `Failed to save: ${err.message}`,
  }
);

// With data transformation
showPromiseToast(
  fetchUserData(),
  {
    loading: 'Loading user data...',
    success: (data) => `Welcome back, ${data.name}!`,
    error: 'Failed to load user data',
  }
);
```

### Dismissing Toasts

```typescript
// Dismiss a specific toast
const toastId = showSuccessToast('Operation started');
setTimeout(() => dismissToast(toastId), 3000);

// Dismiss all toasts
dismissAllToasts();
```

## Real-World Examples

### Settings Form Submission

```typescript
const handleSave = async () => {
  const toastId = showLoadingToast('Saving settings...');
  
  try {
    await saveSettings();
    dismissToast(toastId);
    showSuccessToast('Settings saved!', {
      description: 'Restart the app to apply changes.',
    });
  } catch (error) {
    dismissToast(toastId);
    showErrorToast('Failed to save settings', {
      description: error.message,
    });
  }
};
```

### Transaction Submission

```typescript
const handleSendTransaction = async (params) => {
  showPromiseToast(
    window.electronAPI.send(params),
    {
      loading: 'Broadcasting transaction...',
      success: (result) => `Transaction sent! ID: ${result.txId.slice(0, 8)}...`,
      error: 'Transaction failed. Please try again.',
    }
  );
};
```

### Copy to Clipboard

```typescript
const handleCopyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address);
    showSuccessToast('Address copied!', {
      duration: 2000,
    });
  } catch (error) {
    showErrorToast('Failed to copy address');
  }
};
```

### File Selection

```typescript
const handleSelectFolder = async () => {
  try {
    const result = await window.electronAPI.openDialog({
      properties: ['openDirectory'],
    });
    
    if (result.canceled) {
      showInfoToast('Folder selection cancelled');
      return;
    }
    
    showSuccessToast('Folder selected', {
      description: result.filePaths[0],
    });
  } catch (error) {
    showErrorToast('Failed to open folder dialog');
  }
};
```

### Address Book Operations

```typescript
// Create entry
const handleCreateEntry = async (entry) => {
  showPromiseToast(
    window.electronAPI.addressBook.create(entry),
    {
      loading: 'Adding address...',
      success: 'Address added to address book!',
      error: 'Failed to add address',
    }
  );
};

// Delete entry
const handleDeleteEntry = async (id: string) => {
  showPromiseToast(
    window.electronAPI.addressBook.delete(id),
    {
      loading: 'Deleting address...',
      success: 'Address removed from address book',
      error: 'Failed to delete address',
    }
  );
};
```

## Best Practices

1. **Use appropriate toast types**: Success for completions, error for failures, warning for cautions, info for information.

2. **Keep messages concise**: Main message should be short; use description for details.

3. **Provide context**: Include relevant details in the description.

4. **Add actions when helpful**: Offer "Undo", "Retry", "View", etc. when appropriate.

5. **Use promise toasts for async operations**: They automatically handle loading, success, and error states.

6. **Don't spam toasts**: Avoid showing multiple toasts for the same operation.

7. **Custom durations**: Use shorter durations (2-3s) for simple messages, longer for important ones.

8. **Error messages**: Include actionable information when possible.

## Configuration

The Toaster component is configured in `src/routes/__root.tsx` and automatically:
- Adapts to the current theme (light/dark)
- Stacks toasts vertically
- Queues toasts when multiple are shown
- Provides swipe-to-dismiss on mobile

## Styling

Toasts inherit the application theme automatically. Custom styling can be applied via:
- CSS variables in `src/components/ui/sonner.tsx`
- Tailwind classes in individual toast calls
- Global styles in `src/globals.css`

## References

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [shadcn/ui Sonner Component](https://ui.shadcn.com/docs/components/sonner)
- [Source Code](https://github.com/emilkowalski/sonner)

