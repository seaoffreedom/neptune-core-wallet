# Neptune Core Wallet

A privacy-preserving, quantum-resistant, zk-STARKs-based desktop wallet for the Neptune blockchain.

## Quick Start

### Using Makefile (Recommended)

The project includes a comprehensive Makefile for easy development and build operations:

```bash
# Show all available commands
make help

# Start development server
make dev

# Build the application
make build

# Package the application
make package

# Create distributables (AppImage, deb, rpm)
make make

# Clean build artifacts
make clean

# Clean everything including node_modules
make clean-all

# Show build status
make status
```

### Using pnpm directly

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build the application
pnpm run build

# Package the application
pnpm run package

# Create distributables
pnpm run make
```

## Build System

The Makefile provides a comprehensive build system with the following categories:

### Development
- `make dev` / `make start` - Start development server
- `make restart` - Restart main process (development)
- `make logs` - Show application logs

### Building & Packaging
- `make build` - Build the application
- `make package` - Package the application
- `make make` - Create distributables (deb, rpm, AppImage)
- `make make-appimage` - Create AppImage only
- `make make-deb` - Create Debian package only
- `make make-rpm` - Create RPM package only

### Quality Assurance
- `make test` - Run tests
- `make test-watch` - Run tests in watch mode
- `make test-coverage` - Run tests with coverage
- `make lint` - Run linting
- `make format` - Format code
- `make check` - Run all checks (format + lint)
- `make pre-commit` - Run pre-commit checks
- `make ci` - Run CI checks

### Cleanup
- `make clean` - Clean build artifacts and temporary files
- `make clean-build` - Clean only build directories
- `make clean-cache` - Clean cache directories
- `make clean-logs` - Clean log files
- `make clean-test` - Clean test artifacts
- `make clean-all` - Clean everything including node_modules

### Information
- `make status` - Show build status
- `make info` - Show project information
- `make size` - Show project size
- `make deps` - Show dependency information

### Dependency Management
- `make install` - Install dependencies
- `make update` - Update dependencies
- `make outdated` - Check for outdated dependencies