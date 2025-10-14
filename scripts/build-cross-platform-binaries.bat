@echo off
REM Cross-Platform Binary Build Script for Neptune Core Wallet (Windows)
REM This script builds binaries for Windows

setlocal enabledelayedexpansion

echo 🚀 Starting Cross-Platform Binary Build Process (Windows)

REM Configuration
set NEPTUNE_CORE_REPO=https://github.com/neptune-network/neptune-core.git
set BINARIES_DIR=resources\binaries
set TEMP_DIR=temp-build

REM Check prerequisites
echo 🔍 Checking prerequisites...

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is required but not installed
    exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Rust/Cargo is required but not installed
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup neptune-core repository
echo 📦 Setting up neptune-core repository...

if exist "%TEMP_DIR%\neptune-core" (
    echo Updating existing neptune-core repository...
    cd "%TEMP_DIR%\neptune-core"
    git pull origin main
    cd /d "%~dp0.."
) else (
    echo Cloning neptune-core repository...
    if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
    cd "%TEMP_DIR%"
    git clone "%NEPTUNE_CORE_REPO%"
    cd /d "%~dp0.."
)

echo ✅ neptune-core repository ready

REM Build binaries for Windows
echo 🔨 Building binaries for Windows x64...

cd "%TEMP_DIR%\neptune-core"

REM Build release binaries
cargo build --release
if %errorlevel% neq 0 (
    echo ❌ Failed to build binaries
    exit /b 1
)

REM Create platform directory
set PLATFORM_DIR=win-x64
if not exist "..\..\%BINARIES_DIR%\%PLATFORM_DIR%" mkdir "..\..\%BINARIES_DIR%\%PLATFORM_DIR%"

REM Copy binaries
copy "target\release\neptune-core.exe" "..\..\%BINARIES_DIR%\%PLATFORM_DIR%\"
copy "target\release\neptune-cli.exe" "..\..\%BINARIES_DIR%\%PLATFORM_DIR%\"
copy "target\release\triton-vm-prover.exe" "..\..\%BINARIES_DIR%\%PLATFORM_DIR%\"

echo ✅ Built binaries for %PLATFORM_DIR%

cd /d "%~dp0.."

REM Create placeholder files for missing platforms
echo 📝 Creating placeholder files for missing platforms...

set PLATFORMS=mac-arm64 mac-x64 linux-x64

for %%p in (%PLATFORMS%) do (
    set PLATFORM_DIR=%BINARIES_DIR%\%%p

    if not exist "!PLATFORM_DIR!" mkdir "!PLATFORM_DIR!"

    if not exist "!PLATFORM_DIR!\neptune-core" (
        echo Creating README for %%p...

        (
            echo # %%p Binaries
            echo.
            echo This directory should contain the following binaries for %%p:
            echo.
            echo - `neptune-core` ^(or `neptune-core.exe` on Windows^)
            echo - `neptune-cli` ^(or `neptune-cli.exe` on Windows^)
            echo - `triton-vm-prover` ^(or `triton-vm-prover.exe` on Windows^)
            echo.
            echo ## Building Binaries
            echo.
            echo To build binaries for this platform:
            echo.
            echo 1. Clone the neptune-core repository:
            echo    ```bash
            echo    git clone https://github.com/neptune-network/neptune-core.git
            echo    cd neptune-core
            echo    ```
            echo.
            echo 2. Build release binaries:
            echo    ```bash
            echo    cargo build --release
            echo    ```
            echo.
            echo 3. Copy binaries to this directory:
            echo    ```bash
            echo    cp target/release/neptune-core ./
            echo    cp target/release/neptune-cli ./
            echo    cp target/release/triton-vm-prover ./
            echo    ```
            echo.
            echo 4. Make binaries executable ^(Unix systems only^):
            echo    ```bash
            echo    chmod +x ./*
            echo    ```
            echo.
            echo ## Cross-Compilation
            echo.
            echo For cross-compilation, you may need to install additional toolchains:
            echo.
            echo - **Windows**: `rustup target add x86_64-pc-windows-gnu`
            echo - **macOS**: `rustup target add x86_64-apple-darwin` and `rustup target add aarch64-apple-darwin`
            echo.
            echo Then build with:
            echo ```bash
            echo cargo build --release --target x86_64-pc-windows-gnu
            echo ```
        ) > "!PLATFORM_DIR!\README.md"

        echo ⚠️  Created placeholder for %%p
    )
)

echo ====================================================
echo ✅ Cross-platform binary build process completed!
echo ⚠️  Note: You may need to build binaries for other platforms manually
echo ⚠️  See the README.md files in each platform directory for instructions
echo 💡 To clean up temporary files, run: rmdir /s /q %TEMP_DIR%

endlocal
