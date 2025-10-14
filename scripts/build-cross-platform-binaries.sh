#!/bin/bash

# Cross-Platform Binary Build Script for Neptune Core Wallet
# This script builds binaries for Windows, macOS, and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEPTUNE_CORE_REPO="https://github.com/neptune-network/neptune-core.git"
# Alternative: Use local path if repository exists
LOCAL_NEPTUNE_CORE_PATH="../neptune-core"
BINARIES_DIR="resources/binaries"
TEMP_DIR="temp-build"

echo -e "${BLUE}🚀 Starting Cross-Platform Binary Build Process${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

    if ! command_exists git; then
        print_error "Git is required but not installed"
        exit 1
    fi

    if ! command_exists cargo; then
        print_error "Rust/Cargo is required but not installed"
        exit 1
    fi

    print_status "Prerequisites check passed"
}

# Clone or update neptune-core repository
setup_neptune_core() {
    echo -e "${BLUE}📦 Setting up neptune-core repository...${NC}"

    # Check if local repository exists first
    if [ -d "$LOCAL_NEPTUNE_CORE_PATH" ]; then
        echo "Using local neptune-core repository at $LOCAL_NEPTUNE_CORE_PATH"
        mkdir -p "$TEMP_DIR"
        cp -r "$LOCAL_NEPTUNE_CORE_PATH" "$TEMP_DIR/"
    elif [ -d "$TEMP_DIR/neptune-core" ]; then
        echo "Updating existing neptune-core repository..."
        cd "$TEMP_DIR/neptune-core"
        git pull origin main
        cd - > /dev/null
    else
        echo "Cloning neptune-core repository..."
        mkdir -p "$TEMP_DIR"
        cd "$TEMP_DIR"
        if ! git clone "$NEPTUNE_CORE_REPO"; then
            print_error "Failed to clone neptune-core repository"
            print_warning "Please ensure the repository URL is correct or place neptune-core in ../neptune-core"
            exit 1
        fi
        cd - > /dev/null
    fi

    print_status "neptune-core repository ready"
}

# Build binaries for current platform
build_current_platform() {
    local platform_name=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch_name=$(uname -m)

    echo -e "${BLUE}🔨 Building binaries for current platform: ${platform_name}-${arch_name}${NC}"

    cd "$TEMP_DIR/neptune-core"

    # Build release binaries
    cargo build --release

    # Create platform directory
    local platform_dir=""
    if [[ "$platform_name" == "linux" ]]; then
        platform_dir="linux-x64"
    elif [[ "$platform_name" == "darwin" ]]; then
        if [[ "$arch_name" == "arm64" ]]; then
            platform_dir="mac-arm64"
        else
            platform_dir="mac-x64"
        fi
    elif [[ "$platform_name" == "mingw"* ]] || [[ "$platform_name" == "cygwin"* ]]; then
        platform_dir="win-x64"
    fi

    if [ -n "$platform_dir" ]; then
        mkdir -p "../../$BINARIES_DIR/$platform_dir"

        # Copy binaries
        cp target/release/neptune-core "../../$BINARIES_DIR/$platform_dir/"
        cp target/release/neptune-cli "../../$BINARIES_DIR/$platform_dir/"
        cp target/release/triton-vm-prover "../../$BINARIES_DIR/$platform_dir/"

        # Make binaries executable on Unix systems
        if [[ "$platform_name" != "mingw"* ]] && [[ "$platform_name" != "cygwin"* ]]; then
            chmod +x "../../$BINARIES_DIR/$platform_dir/"*
        fi

        print_status "Built binaries for $platform_dir"
    else
        print_warning "Unknown platform: $platform_name-$arch_name"
    fi

    cd - > /dev/null
}

# Create placeholder files for missing platforms
create_placeholders() {
    echo -e "${BLUE}📝 Creating placeholder files for missing platforms...${NC}"

    local platforms=("mac-arm64" "mac-x64" "win-x64")

    for platform in "${platforms[@]}"; do
        local platform_dir="$BINARIES_DIR/$platform"

        if [ ! -d "$platform_dir" ] || [ ! -f "$platform_dir/neptune-core" ]; then
            mkdir -p "$platform_dir"

            # Create README with build instructions
            cat > "$platform_dir/README.md" << EOF
# $platform Binaries

This directory should contain the following binaries for $platform:

- \`neptune-core\` (or \`neptune-core.exe\` on Windows)
- \`neptune-cli\` (or \`neptune-cli.exe\` on Windows)
- \`triton-vm-prover\` (or \`triton-vm-prover.exe\` on Windows)

## Building Binaries

To build binaries for this platform:

1. Clone the neptune-core repository:
   \`\`\`bash
   git clone https://github.com/neptune-network/neptune-core.git
   cd neptune-core
   \`\`\`

2. Build release binaries:
   \`\`\`bash
   cargo build --release
   \`\`\`

3. Copy binaries to this directory:
   \`\`\`bash
   cp target/release/neptune-core ./
   cp target/release/neptune-cli ./
   cp target/release/triton-vm-prover ./
   \`\`\`

4. Make binaries executable (Unix systems only):
   \`\`\`bash
   chmod +x ./*
   \`\`\`

## Cross-Compilation

For cross-compilation, you may need to install additional toolchains:

- **Windows**: \`rustup target add x86_64-pc-windows-gnu\`
- **macOS**: \`rustup target add x86_64-apple-darwin\` and \`rustup target add aarch64-apple-darwin\`

Then build with:
\`\`\`bash
cargo build --release --target x86_64-pc-windows-gnu
\`\`\`
EOF

            print_warning "Created placeholder for $platform"
        fi
    done
}

# Cleanup
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"

    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        print_status "Cleaned up temporary files"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Neptune Core Wallet - Cross-Platform Binary Builder${NC}"
    echo -e "${BLUE}====================================================${NC}"

    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "resources" ]; then
        print_error "Please run this script from the neptune-core-wallet root directory"
        exit 1
    fi

    check_prerequisites
    setup_neptune_core
    build_current_platform
    create_placeholders

    echo -e "${BLUE}====================================================${NC}"
    print_status "Cross-platform binary build process completed!"
    echo -e "${YELLOW}⚠️  Note: You may need to build binaries for other platforms manually${NC}"
    echo -e "${YELLOW}⚠️  See the README.md files in each platform directory for instructions${NC}"

    # Don't cleanup automatically - let user decide
    echo -e "${BLUE}💡 To clean up temporary files, run: rm -rf $TEMP_DIR${NC}"
}

# Run main function
main "$@"
