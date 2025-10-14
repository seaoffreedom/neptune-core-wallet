#!/bin/bash

# Neptune Core Wallet - Icon Generator
# Generates all required icon formats from SVG source

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ICONS_DIR="$PROJECT_ROOT/public/assets/logos"
SVG_FILE="$ICONS_DIR/neptune.svg"

echo -e "${BLUE}🎨 Generating Neptune Core Wallet Icons${NC}"
echo "=============================================="

# Check if SVG source exists
if [ ! -f "$SVG_FILE" ]; then
    echo -e "${RED}❌ SVG source file not found: $SVG_FILE${NC}"
    echo "Please create the SVG icon first."
    exit 1
fi

# Check for required tools
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 not found. Install it to generate $2 format.${NC}"
        return 1
    fi
    return 0
}

# Generate PNG for Linux (256x256)
echo -e "${BLUE}📱 Generating Linux PNG icon (256x256)...${NC}"
if check_tool "inkscape" "PNG"; then
    inkscape --export-type=png --export-width=256 --export-height=256 \
        "$SVG_FILE" --export-filename="$ICONS_DIR/neptune-256x256.png"
    echo -e "${GREEN}✅ Generated neptune-256x256.png${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping PNG generation (inkscape not available)${NC}"
fi

# Generate ICO for Windows
echo -e "${BLUE}🪟 Generating Windows ICO icon...${NC}"
if check_tool "convert" "ICO"; then
    if [ -f "$ICONS_DIR/neptune-256x256.png" ]; then
        convert "$ICONS_DIR/neptune-256x256.png" "$ICONS_DIR/neptune.ico"
        echo -e "${GREEN}✅ Generated neptune.ico${NC}"
    else
        echo -e "${YELLOW}⚠️  PNG file not found, skipping ICO generation${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping ICO generation (ImageMagick not available)${NC}"
fi

# Generate ICNS for macOS
echo -e "${BLUE}🍎 Generating macOS ICNS icon...${NC}"
if check_tool "magick" "ICNS"; then
    # Generate multiple PNG sizes first
    sizes=(16 32 64 128 256 512 1024)
    png_files=()

    for size in "${sizes[@]}"; do
        png_file="$ICONS_DIR/neptune-${size}x${size}.png"
        if check_tool "inkscape" "PNG"; then
            inkscape --export-type=png --export-width="$size" --export-height="$size" \
                "$SVG_FILE" --export-filename="$png_file"
            png_files+=("$png_file")
        fi
    done

    if [ ${#png_files[@]} -gt 0 ]; then
        # Use ImageMagick to create ICNS from multiple PNG files
        magick "${png_files[@]}" "$ICONS_DIR/neptune.icns"
        echo -e "${GREEN}✅ Generated neptune.icns${NC}"

        # Clean up temporary PNG files
        for png_file in "${png_files[@]}"; do
            if [ "$png_file" != "$ICONS_DIR/neptune-256x256.png" ]; then
                rm -f "$png_file"
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠️  Skipping ICNS generation (ImageMagick not available)${NC}"
fi

echo -e "${GREEN}🎉 Icon generation complete!${NC}"
echo ""
echo "Generated files:"
ls -la "$ICONS_DIR"/*.{png,ico,icns,svg} 2>/dev/null || echo "No icon files found"

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the generated icons"
echo "2. Replace with your custom design if needed"
echo "3. Run 'pnpm make' to test the icons in the packaged app"
