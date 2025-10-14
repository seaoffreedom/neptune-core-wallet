# Neptune Core Wallet Icons

This directory contains the application icons for different platforms.

## Required Icon Files

### For Windows (`.ico`)

- **File**: `neptune.ico`
- **Size**: 256x256 pixels
- **Format**: ICO (Windows Icon)
- **Usage**: Windows executable and installer

### For macOS (`.icns`)

- **File**: `neptune.icns`
- **Sizes**: Multiple sizes (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
- **Format**: ICNS (macOS Icon)
- **Usage**: macOS application bundle and DMG

### For Linux (`.png`)

- **File**: `neptune-256x256.png`
- **Size**: 256x256 pixels
- **Format**: PNG
- **Usage**: Linux AppImage, DEB, and RPM packages

## Optional Files

### SVG Source (`.svg`)

- **File**: `neptune.svg`
- **Format**: SVG (Scalable Vector Graphics)
- **Usage**: Source file for generating other formats

## Icon Design Guidelines

1. **Design**: Should represent Neptune blockchain/cryptocurrency theme
2. **Colors**: Use brand colors (blue/teal for Neptune theme)
3. **Style**: Modern, clean, recognizable at small sizes
4. **Background**: Transparent or solid background that works on light/dark themes

## Tools for Icon Creation

### Online Tools

- [Favicon.io](https://favicon.io/) - Generate ICO files
- [CloudConvert](https://cloudconvert.com/) - Convert between formats
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Multi-format generator

### Desktop Tools

- **GIMP** (Free) - Create and export icons
- **Inkscape** (Free) - SVG editing
- **Adobe Illustrator** - Professional design
- **Sketch** (macOS) - UI/UX design

### Command Line Tools

- **ImageMagick** - Convert and resize images
- **Inkscape** - SVG to PNG conversion
- **png2icns** - PNG to ICNS conversion

## Example Commands

```bash
# Convert SVG to PNG (256x256)
inkscape --export-type=png --export-width=256 --export-height=256 neptune.svg --export-filename=neptune-256x256.png

# Convert PNG to ICO (Windows)
convert neptune-256x256.png neptune.ico

# Convert PNG to ICNS (macOS) - requires png2icns
png2icns neptune.icns neptune-16x16.png neptune-32x32.png neptune-64x64.png neptune-128x128.png neptune-256x256.png neptune-512x512.png neptune-1024x1024.png
```

## Current Status

⚠️ **Icons are not yet created** - Please add the required icon files to this directory.

The application will use default Electron icons until custom icons are provided.
