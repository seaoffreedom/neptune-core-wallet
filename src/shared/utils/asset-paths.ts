/**
 * Utility functions for handling asset paths in development vs production
 */

// Import logos as modules so they get bundled by Vite
// Note: neptune.svg doesn't exist, using PNG instead
import neptuneLogo from '../../assets/logos/neptune-256x256.png';

/**
 * Get the correct path for an asset file
 * @param assetPath - The asset path relative to the public folder (e.g., "assets/logos/neptune.svg")
 * @returns The correct path for the current environment
 */
export function getAssetPath(assetPath: string): string {
  // In development, assets are served from the public folder
  // In production, assets should be in the same directory as the renderer
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.ELECTRON_IS_DEV === '1'
  ) {
    return `/${assetPath}`;
  } else {
    // In production, try multiple possible locations
    // First try relative to the renderer files
    return `./${assetPath}`;
  }
}

/**
 * Get the path for a logo asset
 * @param logoName - The logo filename (e.g., "neptune.svg")
 * @returns The correct path for the logo
 */
export function getLogoPath(logoName: string): string {
  // For now, just return the imported logo for neptune logos
  // This ensures it gets bundled by Vite
  if (logoName === 'neptune.svg' || logoName === 'neptune-256x256.png') {
    return neptuneLogo;
  }
  return getAssetPath(`assets/logos/${logoName}`);
}

/**
 * Get the path for an icon asset
 * @param iconName - The icon filename (e.g., "app-icon-64.png")
 * @returns The correct path for the icon
 */
export function getIconPath(iconName: string): string {
  return getAssetPath(`assets/icons/${iconName}`);
}

/**
 * Get the path for a UI asset
 * @param uiAssetName - The UI asset filename
 * @returns The correct path for the UI asset
 */
export function getUIAssetPath(uiAssetName: string): string {
  return getAssetPath(`assets/ui/${uiAssetName}`);
}
