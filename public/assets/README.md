# Assets Directory

This directory contains all static assets for the Trident Wallet application.

## Directory Structure

- `logos/` - Application and brand logos
- `icons/` - App icons for different sizes and platforms
- `ui/` - UI-specific assets (backgrounds, illustrations, patterns)
- `branding/` - Branding assets (favicon, splash screens)

## Usage in Code

```typescript
// In React components
<img src="/assets/logos/trident-wallet-logo.svg" alt="Trident Wallet" />

// For app icons
const appIcon = "/assets/icons/app-icon-64.png";
```

## File Formats

- **SVG**: Preferred for logos and scalable graphics
- **PNG**: For icons and images with transparency
- **ICO**: For favicon and Windows app icons
- **JPG**: For photographs and complex images

## Optimization

- Use SVG for logos and simple graphics
- Optimize PNG files for web (use tools like ImageOptim)
- Provide multiple sizes for app icons (16, 32, 64, 128, 256, 512px)
- Keep file sizes small for better performance
