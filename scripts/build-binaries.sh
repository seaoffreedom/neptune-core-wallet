#!/bin/bash

# Neptune Core Wallet - Cross-Platform Binary Build Script
# This script builds the Rust binaries for all supported platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEPTUNE_CORE_REPO="../neptune-core"
BINARIES_DIR="resources/binaries"

echo -e "${BLUE}🚀 Neptune Core Wallet - Cross-Platform Binary Builder${NC}"
echo "=================================================="

# Check if neptune-core repository exists
if [ ! -d "$NEPTUNE_CORE_REPO" ]; then
    echo -e "${RED}❌ Error: Neptune Core repository not found at $NEPTUNE_CORE_REPO${NC}"
    echo "Please clone the neptune-core repository to the parent directory:"
    echo "git clone <neptune-core-repo-url> ../neptune-core"
    exit 1
fi

# Function to build for a specific target
build_target() {
    local target=$1
    local platform_dir=$2
    local description=$3
    
    echo -e "${YELLOW}📦 Building for $description ($target)...${NC}"
    
    # Build the binaries
    cd "$NEPTUNE_CORE_REPO"
    cargo build --release --target "$target"
    
    # Create platform directory if it doesn't exist
    mkdir -p "../neptune-core-wallet/$BINARIES_DIR/$platform_dir"
    
    # Copy binaries to the correct location
    local extension=""
    if [[ "$target" == *"windows"* ]]; then
        extension=".exe"
    fi
    
    cp "target/$target/release/neptune-core$extension" "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/"
    cp "target/$target/release/neptune-cli$extension" "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/"
    cp "target/$target/release/triton-vm-prover$extension" "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/"
    
    # Make binaries executable on Unix systems
    if [[ "$target" != *"windows"* ]]; then
        chmod +x "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/neptune-core"
        chmod +x "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/neptune-cli"
        chmod +x "../neptune-core-wallet/$BINARIES_DIR/$platform_dir/triton-vm-prover"
    fi
    
    echo -e "${GREEN}✅ Successfully built $description binaries${NC}"
    cd "../neptune-core-wallet"
}

# Build for all supported platforms
echo -e "${BLUE}🔨 Building binaries for all platforms...${NC}"

# Linux x64
build_target "x86_64-unknown-linux-gnu" "linux-x64" "Linux x64"

# macOS x64 (Intel Macs)
build_target "x86_64-apple-darwin" "mac-x64" "macOS x64 (Intel)"

# macOS ARM64 (Apple Silicon)
build_target "aarch64-apple-darwin" "mac-arm64" "macOS ARM64 (Apple Silicon)"

# Windows x64
build_target "x86_64-pc-windows-gnu" "win-x64" "Windows x64"

echo ""
echo -e "${GREEN}🎉 All binaries built successfully!${NC}"
echo ""
echo -e "${BLUE}📁 Binary locations:${NC}"
echo "  Linux x64:    $BINARIES_DIR/linux-x64/"
echo "  macOS x64:    $BINARIES_DIR/mac-x64/"
echo "  macOS ARM64:  $BINARIES_DIR/mac-arm64/"
echo "  Windows x64:  $BINARIES_DIR/win-x64/"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "  1. Test the binaries: pnpm start"
echo "  2. Build AppImage: pnpm run build:appimage"
echo "  3. Build macOS: pnpm run build:mac"
echo "  4. Build Windows: pnpm run build:win"
echo ""
