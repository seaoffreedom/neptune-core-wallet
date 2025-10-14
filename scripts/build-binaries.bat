@echo off
REM Neptune Core Wallet - Cross-Platform Binary Build Script for Windows
REM This script builds the Rust binaries for all supported platforms

setlocal enabledelayedexpansion

echo 🚀 Neptune Core Wallet - Cross-Platform Binary Builder
echo ==================================================

REM Configuration
set NEPTUNE_CORE_REPO=..\neptune-core
set BINARIES_DIR=resources\binaries

REM Check if neptune-core repository exists
if not exist "%NEPTUNE_CORE_REPO%" (
    echo ❌ Error: Neptune Core repository not found at %NEPTUNE_CORE_REPO%
    echo Please clone the neptune-core repository to the parent directory:
    echo git clone ^<neptune-core-repo-url^> ..\neptune-core
    exit /b 1
)

REM Function to build for a specific target
:build_target
set target=%1
set platform_dir=%2
set description=%3

echo 📦 Building for %description% (%target%)...

REM Build the binaries
cd /d "%NEPTUNE_CORE_REPO%"
cargo build --release --target %target%

REM Create platform directory if it doesn't exist
if not exist "..\neptune-core-wallet\%BINARIES_DIR%\%platform_dir%" (
    mkdir "..\neptune-core-wallet\%BINARIES_DIR%\%platform_dir%"
)

REM Copy binaries to the correct location
set extension=
if "%target%"=="x86_64-pc-windows-gnu" set extension=.exe

copy "target\%target%\release\neptune-core%extension%" "..\neptune-core-wallet\%BINARIES_DIR%\%platform_dir%\"
copy "target\%target%\release\neptune-cli%extension%" "..\neptune-core-wallet\%BINARIES_DIR%\%platform_dir%\"
copy "target\%target%\release\triton-vm-prover%extension%" "..\neptune-core-wallet\%BINARIES_DIR%\%platform_dir%\"

echo ✅ Successfully built %description% binaries
cd /d "..\neptune-core-wallet"
goto :eof

REM Build for all supported platforms
echo 🔨 Building binaries for all platforms...

REM Linux x64
call :build_target "x86_64-unknown-linux-gnu" "linux-x64" "Linux x64"

REM macOS x64 (Intel Macs)
call :build_target "x86_64-apple-darwin" "mac-x64" "macOS x64 (Intel)"

REM macOS ARM64 (Apple Silicon)
call :build_target "aarch64-apple-darwin" "mac-arm64" "macOS ARM64 (Apple Silicon)"

REM Windows x64
call :build_target "x86_64-pc-windows-gnu" "win-x64" "Windows x64"

echo.
echo 🎉 All binaries built successfully!
echo.
echo 📁 Binary locations:
echo   Linux x64:    %BINARIES_DIR%\linux-x64\
echo   macOS x64:    %BINARIES_DIR%\mac-x64\
echo   macOS ARM64:  %BINARIES_DIR%\mac-arm64\
echo   Windows x64:  %BINARIES_DIR%\win-x64\
echo.
echo 🚀 Next steps:
echo   1. Test the binaries: pnpm start
echo   2. Build AppImage: pnpm run build:appimage
echo   3. Build macOS: pnpm run build:mac
echo   4. Build Windows: pnpm run build:win
echo.
