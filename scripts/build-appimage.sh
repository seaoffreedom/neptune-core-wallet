#!/bin/bash

# Neptune Core Wallet - AppImage Builder
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
APP_CATEGORIES="Office;Finance;"
APP_ICON="public/assets/logos/neptune.svg"

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGED_DIR="$PROJECT_ROOT/out/neptune-core-wallet-linux-x64"
OUTPUT_DIR="$PROJECT_ROOT/out/appimage"
TEMP_DIR="/tmp/neptune-appimage-build"

echo -e "${BLUE}🚀 Building Neptune Core Wallet AppImage${NC}"
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
mkdir -p "$TEMP_DIR/usr/bin"
mkdir -p "$TEMP_DIR/usr/share/applications"
mkdir -p "$TEMP_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$TEMP_DIR/usr/share/metainfo"

# Copy the packaged application
echo -e "${BLUE}📦 Copying packaged application...${NC}"
cp -r "$PACKAGED_DIR"/* "$TEMP_DIR/usr/bin/"

# Create desktop entry
echo -e "${BLUE}📝 Creating desktop entry...${NC}"
cat > "$TEMP_DIR/usr/share/applications/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Neptune Core Wallet
Comment=${APP_DESCRIPTION}
Exec=${APP_NAME}
Icon=${APP_NAME}
Categories=${APP_CATEGORIES}
StartupNotify=true
StartupWMClass=Neptune Core Wallet
EOF

# Create AppStream metainfo
echo -e "${BLUE}📋 Creating AppStream metainfo...${NC}"
cat > "$TEMP_DIR/usr/share/metainfo/${APP_NAME}.appdata.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${APP_NAME}</id>
  <metadata_license>MIT</metadata_license>
  <project_license>MIT</project_license>
  <name>Neptune Core Wallet</name>
  <summary>${APP_DESCRIPTION}</summary>
  <description>
    <p>Neptune Core Wallet is a privacy-preserving, quantum-resistant cryptocurrency wallet built on the Neptune blockchain. It provides secure transaction management, mining capabilities, and peer-to-peer networking.</p>
    <p>Features:</p>
    <ul>
      <li>Privacy-preserving transactions with zk-STARKs</li>
      <li>Quantum-resistant cryptography</li>
      <li>Built-in mining capabilities</li>
      <li>Peer-to-peer networking</li>
      <li>Cross-platform support</li>
    </ul>
  </description>
  <launchable type="desktop-id">${APP_NAME}.desktop</launchable>
  <url type="homepage">https://github.com/Neptune-Crypto/neptune-core-wallet</url>
  <url type="bugtracker">https://github.com/Neptune-Crypto/neptune-core-wallet/issues</url>
  <screenshots>
    <screenshot type="default">
      <caption>Neptune Core Wallet Main Interface</caption>
    </screenshot>
  </screenshots>
  <releases>
    <release version="${APP_VERSION}" date="$(date -I)" />
  </releases>
  <categories>
    <category>Office</category>
    <category>Finance</category>
  </categories>
  <keywords>
    <keyword>cryptocurrency</keyword>
    <keyword>wallet</keyword>
    <keyword>blockchain</keyword>
    <keyword>privacy</keyword>
    <keyword>mining</keyword>
  </keywords>
</component>
EOF

# Copy icon if it exists
if [ -f "$PROJECT_ROOT/$APP_ICON" ]; then
    echo -e "${BLUE}🎨 Copying application icon...${NC}"
    cp "$PROJECT_ROOT/$APP_ICON" "$TEMP_DIR/usr/share/icons/hicolor/256x256/apps/${APP_NAME}.svg"
else
    echo -e "${YELLOW}⚠️  Icon not found at $APP_ICON, skipping...${NC}"
fi

# Create AppRun script
echo -e "${BLUE}🔧 Creating AppRun script...${NC}"
cat > "$TEMP_DIR/AppRun" << 'EOF'
#!/bin/bash

# Get the directory where AppRun is located
HERE="$(dirname "$(readlink -f "${0}")")"

# Set environment variables
export PATH="${HERE}/usr/bin:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/bin:${LD_LIBRARY_PATH}"

# Change to the application directory
cd "${HERE}/usr/bin"

# Run the application
exec "./neptune-core-wallet" "$@"
EOF

chmod +x "$TEMP_DIR/AppRun"

# Create AppImage using appimagetool if available, otherwise use electron-builder
if command -v appimagetool &> /dev/null; then
    echo -e "${BLUE}🛠️  Creating AppImage with appimagetool...${NC}"
    appimagetool "$TEMP_DIR" "$OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-x86_64.AppImage"
elif command -v npx &> /dev/null; then
    echo -e "${BLUE}🛠️  Creating AppImage with electron-builder...${NC}"
    # Create a simple electron-builder config for AppImage
    cat > "$PROJECT_ROOT/electron-builder-appimage.yml" << EOF
appId: com.neptune.wallet
productName: Neptune Core Wallet
directories:
  output: out/appimage
files:
  - "out/neptune-core-wallet-linux-x64/**/*"
linux:
  target:
    - AppImage
  category: Office
  description: ${APP_DESCRIPTION}
  icon: ${APP_ICON}
EOF

    npx electron-builder --config electron-builder-appimage.yml --linux AppImage
    rm -f "$PROJECT_ROOT/electron-builder-appimage.yml"
else
    echo -e "${YELLOW}⚠️  Neither appimagetool nor electron-builder found. Creating a portable directory instead...${NC}"
    cp -r "$TEMP_DIR" "$OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable"
    echo -e "${GREEN}✅ Portable application created at: $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable${NC}"
    echo -e "${YELLOW}💡 To run: cd $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable && ./AppRun${NC}"
fi

# Clean up temp directory
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

# Display results
echo ""
echo -e "${GREEN}✅ AppImage build completed!${NC}"
echo "=================================================="
if [ -f "$OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-x86_64.AppImage" ]; then
    echo -e "${GREEN}📦 AppImage created: $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-x86_64.AppImage${NC}"
    echo -e "${BLUE}💡 To run: chmod +x $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-x86_64.AppImage && $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-x86_64.AppImage${NC}"
elif [ -d "$OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable" ]; then
    echo -e "${GREEN}📦 Portable application created: $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable${NC}"
    echo -e "${BLUE}💡 To run: cd $OUTPUT_DIR/${APP_NAME}-${APP_VERSION}-portable && ./AppRun${NC}"
fi

echo ""
echo -e "${BLUE}🔍 File sizes:${NC}"
ls -lh "$OUTPUT_DIR"/

echo ""
echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
