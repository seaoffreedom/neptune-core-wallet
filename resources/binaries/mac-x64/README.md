# macOS x64 (Intel) Binaries

This directory should contain the following binaries for macOS x64:

- `neptune-core`
- `neptune-cli`
- `triton-vm-prover`

## Building Binaries

To build binaries for macOS x64:

1. Clone the neptune-core repository:

   ```bash
   git clone <neptune-core-repo-url>
   cd neptune-core
   ```

2. Build release binaries:

   ```bash
   cargo build --release
   ```

3. Copy binaries to this directory:

   ```bash
   cp target/release/neptune-core ./
   cp target/release/neptune-cli ./
   cp target/release/triton-vm-prover ./
   ```

4. Make binaries executable:
   ```bash
   chmod +x ./*
   ```

## Cross-Compilation

For cross-compilation from other platforms:

```bash
# Install macOS x64 target
rustup target add x86_64-apple-darwin

# Build for macOS x64
cargo build --release --target x86_64-apple-darwin
```
