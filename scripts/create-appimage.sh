#!/bin/bash

# Neptune Core Wallet - AppImage Creator
# Creates a portable AppImage from the packaged Electron application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="neptune-core-wallet"
APP_VERSION="1.0.0"
APP_DESCRIPTION="Neptune Core Wallet - Privacy-preserving, quantum-resistant cryptocurrency wallet"

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGED_DIR="$PROJECT_ROOT/out/neptune-core-wallet-linux-x64"
OUTPUT_DIR="$PROJECT_ROOT/out/appimage"
TEMP_DIR="/tmp/neptune-appimage-build"

echo -e "${BLUE}🚀 Creating Neptune Core Wallet AppImage${NC}"
echo "=================================================="

# Check if packaged application exists
if [ ! -d "$PACKAGED_DIR" ]; then
    echo -e "${RED}❌ Packaged application not found at: $PACKAGED_DIR${NC}"
    echo "Please run 'pnpm make' first to package the application."
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Clean up any existing temp directory
if [ -d "$TEMP_DIR" ]; then
    echo -e "${YELLOW}🧹 Cleaning up existing temp directory...${NC}"
    rm -rf "$TEMP_DIR"
fi

# Create temp directory structure
echo -e "${BLUE}📁 Creating AppImage structure...${NC}"
mkdir -p "$TEMP_DIR/AppDir/usr/bin"
mkdir -p "$TEMP_DIR/AppDir/usr/share/applications"
mkdir -p "$TEMP_DIR/AppDir/usr/share/icons/hicolor/256x256/apps"

# Copy the packaged application
echo -e "${BLUE}📦 Copying packaged application...${NC}"
cp -r "$PACKAGED_DIR"/* "$TEMP_DIR/AppDir/usr/bin/"

# Create desktop entry
echo -e "${BLUE}📝 Creating desktop entry...${NC}"
cat > "$TEMP_DIR/AppDir/usr/share/applications/neptune-core-wallet.desktop" << EOF
[Desktop Entry]
Name=Neptune Core Wallet
Comment=$APP_DESCRIPTION
Exec=neptune-core-wallet
Icon=neptune-core-wallet
Terminal=false
Type=Application
Categories=Office;Finance;
StartupWMClass=neptune-core-wallet
EOF

# Copy icon (if exists)
if [ -f "$PROJECT_ROOT/public/assets/logos/neptune.svg" ]; then
    echo -e "${BLUE}🎨 Copying icon...${NC}"
    cp "$PROJECT_ROOT/public/assets/logos/neptune.svg" "$TEMP_DIR/AppDir/usr/share/icons/hicolor/256x256/apps/neptune-core-wallet.svg"
fi

# Create AppRun script
echo -e "${BLUE}🔧 Creating AppRun script...${NC}"
cat > "$TEMP_DIR/AppDir/AppRun" << 'EOF'
#!/bin/bash

# Get the directory where AppRun is located
HERE="$(dirname "$(readlink -f "${0}")")"

# Set environment variables
export PATH="$HERE/usr/bin:$PATH"
export LD_LIBRARY_PATH="$HERE/usr/bin:$LD_LIBRARY_PATH"

# Change to the application directory
cd "$HERE/usr/bin"

# Run the application
exec "./neptune-core-wallet" "$@"
EOF

chmod +x "$TEMP_DIR/AppDir/AppRun"

# Create AppImage using appimagetool if available, otherwise create a simple archive
if command -v appimagetool >/dev/null 2>&1; then
    echo -e "${BLUE}🛠️ Creating AppImage with appimagetool...${NC}"
    appimagetool "$TEMP_DIR/AppDir" "$OUTPUT_DIR/neptune-core-wallet-$APP_VERSION-x86_64.AppImage"
    echo -e "${GREEN}✅ AppImage created successfully!${NC}"
    echo -e "${GREEN}📁 Location: $OUTPUT_DIR/neptune-core-wallet-$APP_VERSION-x86_64.AppImage${NC}"
else
    echo -e "${YELLOW}⚠️ appimagetool not found. Creating portable archive instead...${NC}"

    # Create a portable archive
    cd "$TEMP_DIR"
    tar -czf "$OUTPUT_DIR/neptune-core-wallet-$APP_VERSION-portable.tar.gz" AppDir/

    echo -e "${GREEN}✅ Portable archive created successfully!${NC}"
    echo -e "${GREEN}📁 Location: $OUTPUT_DIR/neptune-core-wallet-$APP_VERSION-portable.tar.gz${NC}"
    echo -e "${YELLOW}💡 To use: Extract and run ./AppDir/AppRun${NC}"
fi

# Clean up temp directory
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 AppImage creation completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Test the AppImage/archive on a clean system"
echo "2. Verify all dependencies are included"
echo "3. Test the wallet functionality"
echo "4. Distribute to users"
