# Blank Screen Fix - Electron App Packaging Issue

## Problem Summary

The packaged Electron application (and AppImage) was showing a blank screen on startup, while the development version worked perfectly. This issue affected both X11 and Wayland display servers on Linux.

## Root Cause

The issue was caused by **aggressive Rollup tree-shaking optimization** in the Vite configuration that was removing the entire React application code during the production build. The tree-shaking settings were configured with:

```typescript
treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false,
}
```

These aggressive settings caused Rollup to incorrectly identify the React application code as "unused" and remove it from the bundle, resulting in:

- **Empty JavaScript chunks**: Most vendor chunks were 1 byte files containing no code
- **Minimal entry file**: The main entry file (`index-*.js`) contained only 711 bytes of Vite's module preloader, not the actual React application
- **HTML loads but React doesn't render**: The HTML file loaded correctly, but since the JavaScript bundles were empty, React never initialized

## The Fix

### Changed File: `vite.renderer.config.ts`

**Before (lines 87-92):**

```typescript
treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false,
},
```

**After (line 68):**

```typescript
treeshake: true,
```

By changing from aggressive tree-shaking configuration to the default (`true`), Rollup now correctly identifies and preserves the React application code.

### Result

After the fix, the production build generates proper JavaScript bundles:

- **Before**: `index-CjEEsHEF.js` - 711 bytes (only module preloader)
- **After**:
  - `index-BGE_-5ov.js` - 1.7MB (main application bundle)
  - `index-SrsPZ7Fs.js` - 42KB (vendor bundle)

## Additional Changes Made During Investigation

While fixing the blank screen issue, several other improvements were made to the packaging and window lifecycle:

### 1. Fixed HTML File Path Resolution (`src/main.ts`)

**Changed from:**

```typescript
const indexPath = path.join(
  __dirname,
  `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
);
```

**To:**

```typescript
const indexPath = path.join(
  process.resourcesPath,
  "../.vite/renderer/main_window/.vite/renderer/main_window/index.html",
);
```

This ensures the packaged app correctly locates the renderer's HTML file within the asar archive.

### 2. Switched File Loading Method (`src/main.ts`)

**Changed from:**

```typescript
const fileUrl = url.format({
  pathname: indexPath,
  protocol: "file:",
  slashes: true,
});
mainWindow.loadURL(fileUrl);
```

**To:**

```typescript
mainWindow.loadFile(indexPath);
```

`loadFile()` properly handles asar file paths and resolves relative asset paths correctly.

### 3. GPU Acceleration Fixes (`src/main.ts`)

Added comprehensive GPU disabling flags to prevent crashes on Linux (especially with Wayland):

```typescript
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("--disable-gpu");
app.commandLine.appendSwitch("--disable-gpu-sandbox");
app.commandLine.appendSwitch("--disable-software-rasterizer");
app.commandLine.appendSwitch("--disable-gpu-process-crash-limit");
app.commandLine.appendSwitch("--disable-gpu-compositing");
app.commandLine.appendSwitch("--disable-3d-apis");
app.commandLine.appendSwitch("--disable-webgl");
app.commandLine.appendSwitch("--disable-webgl2");
app.commandLine.appendSwitch("--disable-accelerated-2d-canvas");
// ... additional switches
```

### 4. Window Lifecycle Improvements (`src/main.ts`)

Moved `createWindow()` call to happen **before** IPC handler registration to ensure the window is created as early as possible:

```typescript
app.whenReady().then(() => {
  try {
    createWindow();
  } catch (error) {
    // Error handling
  }

  // Register IPC handlers after window creation
  try {
    ipcMain.handle("dialog:select-directory", handleSelectDirectory);
    registerDataDirectoryHandlers();
    // ... other handlers
  } catch (error) {
    // Error handling
  }
});
```

### 5. Removed Manual Chunk Splitting (`vite.renderer.config.ts`)

**Simplified from:**

```typescript
manualChunks: (id: string) => {
  // Complex chunking logic for react-vendor, router-vendor, ui-vendor, etc.
  // Multiple conditional checks for different dependency types
};
```

**To:**

```typescript
// Removed manual chunking entirely - let Vite handle it automatically
```

Manual chunking was creating empty chunks and interfering with the build process.

## Verification Steps

To verify the fix works:

1. **Build the app:**

   ```bash
   pnpm run package
   ```

2. **Check JavaScript bundle sizes:**

   ```bash
   ls -lh .vite/renderer/main_window/assets/*.js
   ```

   You should see files with substantial sizes (1-2MB for main app, 40KB+ for vendors), not 1-byte files.

3. **Run the packaged app:**

   ```bash
   cd out/neptune-core-wallet-linux-x64
   ./neptune-core-wallet
   ```

   The app should load with the full UI visible, not a blank screen.

4. **Check DevTools console:**
   - Open DevTools (Ctrl+Shift+I)
   - Look for the message: "Renderer process loaded successfully"
   - Verify "Root element exists: true"
   - Check that Body content shows the full React component tree, not just `<div id="root"></div>`

## Lessons Learned

1. **Aggressive tree-shaking can break applications**: While tree-shaking is important for bundle size optimization, overly aggressive settings can remove necessary code. The default Vite/Rollup tree-shaking (`true`) is sufficient for most applications.

2. **Production builds behave differently**: Always test packaged applications, not just development builds. Issues that don't appear in development can surface in production due to different build optimizations.

3. **Electron packaging requires careful path handling**: File paths that work in development (with Vite dev server) need different handling in packaged apps (with asar archives).

4. **Debugging packaged apps**: Add comprehensive logging to trace execution flow in both main and renderer processes. This was crucial for identifying where the build process was failing.

## Related Issues

- Electron asar file path resolution
- Vite production build optimization
- Rollup tree-shaking behavior
- Electron window lifecycle management
- Linux GPU acceleration compatibility (Wayland/X11)

## Testing Checklist for Future Changes

When modifying the Vite configuration or build process:

- [ ] Build the packaged app: `pnpm run package`
- [ ] Check JavaScript bundle sizes are reasonable (>100KB for main app)
- [ ] Test the packaged executable: `out/neptune-core-wallet-linux-x64/neptune-core-wallet`
- [ ] Verify the UI renders correctly (not blank screen)
- [ ] Check DevTools console for errors
- [ ] Test on both X11 and Wayland (if on Linux)
- [ ] Verify all routes and navigation work
- [ ] Test IPC communication between main and renderer processes

## Performance Impact

The fix **removed** aggressive tree-shaking optimizations, which means:

- **Bundle size increase**: The final bundle is larger (1.7MB vs potentially smaller with aggressive tree-shaking)
- **No runtime performance impact**: Tree-shaking only affects bundle size, not runtime performance
- **Acceptable trade-off**: Having a working application is more important than saving a few hundred KB

If bundle size becomes a concern in the future, consider:

1. Manual lazy loading of heavy components
2. Code splitting at the route level
3. Analyzing bundle composition with `rollup-plugin-visualizer`
4. Selective tree-shaking for specific large dependencies

## Status

✅ **RESOLVED** - The blank screen issue is fixed. The packaged Electron app now renders the React application correctly on both X11 and Wayland.

---

**Date Fixed**: 2025-10-08
**Affected Versions**: All packaged builds before this fix
**Fixed In**: Latest build with updated `vite.renderer.config.ts`
