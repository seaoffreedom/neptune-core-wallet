# Cross-Platform Binary Structure

This directory contains the platform-specific binaries for Neptune Core Wallet.

## Directory Structure

```
resources/binaries/
├── linux-x64/          # Linux x64 binaries
│   ├── neptune-core
│   ├── neptune-cli
│   └── triton-vm-prover
├── mac-x64/            # macOS Intel binaries
│   ├── neptune-core
│   ├── neptune-cli
│   └── triton-vm-prover
├── mac-arm64/          # macOS Apple Silicon binaries
│   ├── neptune-core
│   ├── neptune-cli
│   └── triton-vm-prover
└── win-x64/            # Windows x64 binaries
    ├── neptune-core.exe
    ├── neptune-cli.exe
    └── triton-vm-prover.exe
```

## Building Binaries

### Prerequisites

1. **Rust Toolchain**: Install Rust with cross-compilation targets
2. **Neptune Core Repository**: Clone the neptune-core repository to `../neptune-core`

### Quick Build (All Platforms)

**Linux/macOS:**
```bash
pnpm run build:binaries
```

**Windows:**
```cmd
pnpm run build:binaries:win
```

### Manual Build

**Linux x64:**
```bash
cd ../neptune-core
cargo build --release --target x86_64-unknown-linux-gnu
cp target/x86_64-unknown-linux-gnu/release/neptune-* ../neptune-core-wallet/resources/binaries/linux-x64/
```

**macOS x64 (Intel):**
```bash
cd ../neptune-core
cargo build --release --target x86_64-apple-darwin
cp target/x86_64-apple-darwin/release/neptune-* ../neptune-core-wallet/resources/binaries/mac-x64/
```

**macOS ARM64 (Apple Silicon):**
```bash
cd ../neptune-core
cargo build --release --target aarch64-apple-darwin
cp target/aarch64-apple-darwin/release/neptune-* ../neptune-core-wallet/resources/binaries/mac-arm64/
```

**Windows x64:**
```bash
cd ../neptune-core
cargo build --release --target x86_64-pc-windows-gnu
cp target/x86_64-pc-windows-gnu/release/neptune-*.exe ../neptune-core-wallet/resources/binaries/win-x64/
```

## Cross-Compilation Setup

### Linux to Windows
```bash
rustup target add x86_64-pc-windows-gnu
sudo apt-get install gcc-mingw-w64-x86-64
```

### Linux to macOS
```bash
# Install osxcross (requires macOS SDK)
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
```

### macOS to Windows
```bash
rustup target add x86_64-pc-windows-gnu
brew install mingw-w64
```

## Building Electron Apps

Once binaries are built, you can create platform-specific packages:

```bash
# Linux AppImage
pnpm run build:appimage

# Linux DEB package
pnpm run build:deb

# macOS DMG
pnpm run build:mac

# Windows NSIS installer
pnpm run build:win

# All platforms
pnpm run build:all
```

## Binary Path Resolution

The application automatically detects the current platform and architecture:

- **Linux x64**: `resources/binaries/linux-x64/`
- **macOS Intel**: `resources/binaries/mac-x64/`
- **macOS Apple Silicon**: `resources/binaries/mac-arm64/`
- **Windows x64**: `resources/binaries/win-x64/`

Windows binaries automatically get the `.exe` extension.

## Troubleshooting

### Missing Binaries
If you get "binary not found" errors:
1. Ensure the neptune-core repository is cloned to `../neptune-core`
2. Run the build script: `pnpm run build:binaries`
3. Check that binaries are executable (Unix systems): `chmod +x resources/binaries/*/neptune-*`

### Cross-Compilation Issues
- Ensure all required targets are installed: `rustup target list --installed`
- Install cross-compilation toolchains for your target platforms
- For macOS targets, you may need the macOS SDK (osxcross)

### Platform Detection
The application uses Node.js `platform()` and `arch()` functions:
- `platform()`: `linux`, `darwin`, `win32`
- `arch()`: `x64`, `arm64`

## File Permissions

On Unix systems (Linux/macOS), ensure binaries are executable:
```bash
chmod +x resources/binaries/linux-x64/*
chmod +x resources/binaries/mac-x64/*
chmod +x resources/binaries/mac-arm64/*
```
