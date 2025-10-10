#!/usr/bin/env bash
#
# Neptune Core Wallet Data Migration Script
#
# This script migrates application data from the old "my-electron" directory
# to the new "neptune-core-wallet" directory.
#
# Usage: ./scripts/migrate-app-data.sh
#

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine OS and set paths
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Check for both old directory names
    if [[ -d "$HOME/.config/my-electron" ]]; then
        OLD_DIR="$HOME/.config/my-electron"
    elif [[ -d "$HOME/.config/Neptune Core Wallet" ]]; then
        OLD_DIR="$HOME/.config/Neptune Core Wallet"
    fi
    NEW_DIR="$HOME/.config/neptune-core-wallet"
    PLATFORM="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Check for both old directory names
    if [[ -d "$HOME/Library/Application Support/my-electron" ]]; then
        OLD_DIR="$HOME/Library/Application Support/my-electron"
    elif [[ -d "$HOME/Library/Application Support/Neptune Core Wallet" ]]; then
        OLD_DIR="$HOME/Library/Application Support/Neptune Core Wallet"
    fi
    NEW_DIR="$HOME/Library/Application Support/neptune-core-wallet"
    PLATFORM="macOS"
else
    echo -e "${RED}Error: This script is for Linux/macOS only.${NC}"
    echo "For Windows, use: scripts/migrate-app-data.ps1"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Neptune Core Wallet - Data Migration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Platform: ${GREEN}$PLATFORM${NC}"
echo ""

# Check if old directory exists
if [[ -z "$OLD_DIR" ]] || [[ ! -d "$OLD_DIR" ]]; then
    echo -e "${YELLOW}ℹ No old directory found to migrate from.${NC}"
    echo ""
    echo "Checked locations:"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  • ~/.config/my-electron"
        echo "  • ~/.config/Neptune Core Wallet"
    else
        echo "  • ~/Library/Application Support/my-electron"
        echo "  • ~/Library/Application Support/Neptune Core Wallet"
    fi
    echo ""
    echo -e "${GREEN}✓ Nothing to migrate!${NC}"
    echo ""
    echo "This is expected if:"
    echo "  • You've already migrated"
    echo "  • This is a fresh installation"
    echo "  • You deleted the old directory"
    exit 0
fi

# Check if new directory already exists
if [[ -d "$NEW_DIR" ]]; then
    echo -e "${YELLOW}⚠ New directory already exists:${NC}"
    echo -e "  $NEW_DIR"
    echo ""
    echo -e "${YELLOW}This directory will be backed up before migration.${NC}"
    BACKUP_DIR="${NEW_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "Backup location: ${BLUE}$BACKUP_DIR${NC}"
    echo ""
fi

# Show what will be migrated
echo -e "${BLUE}Migration Plan:${NC}"
echo -e "  From: ${YELLOW}$OLD_DIR${NC}"
echo -e "  To:   ${GREEN}$NEW_DIR${NC}"
echo ""

# Check old directory size
OLD_SIZE=$(du -sh "$OLD_DIR" | cut -f1)
echo -e "Old directory size: ${YELLOW}$OLD_SIZE${NC}"
echo ""

# List important files
echo -e "${BLUE}Files to migrate:${NC}"
if [[ -f "$OLD_DIR/neptune-core-settings.json" ]]; then
    SIZE=$(ls -lh "$OLD_DIR/neptune-core-settings.json" | awk '{print $5}')
    echo -e "  ${GREEN}✓${NC} neptune-core-settings.json (${SIZE})"
else
    echo -e "  ${YELLOW}○${NC} neptune-core-settings.json (not found)"
fi

if [[ -f "$OLD_DIR/address-book.json" ]]; then
    SIZE=$(ls -lh "$OLD_DIR/address-book.json" | awk '{print $5}')
    echo -e "  ${GREEN}✓${NC} address-book.json (${SIZE})"
else
    echo -e "  ${YELLOW}○${NC} address-book.json (not found)"
fi

echo -e "  ${GREEN}✓${NC} Browser cache and session data"
echo ""

# Prompt for confirmation
echo -e "${YELLOW}⚠ Important:${NC}"
echo "  • Make sure Neptune Core Wallet is NOT running"
echo "  • The old directory will remain (not deleted)"
echo "  • You can manually delete it after verifying the migration"
echo ""
read -p "Continue with migration? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting migration...${NC}"
echo ""

# Backup existing new directory if it exists
if [[ -d "$NEW_DIR" ]]; then
    echo -e "Creating backup: ${BLUE}$BACKUP_DIR${NC}"
    mv "$NEW_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✓ Backup created${NC}"
    echo ""
fi

# Copy old directory to new location
echo -e "Copying data..."
cp -r "$OLD_DIR" "$NEW_DIR"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Data copied successfully${NC}"
    echo ""

    # Verify critical files
    echo -e "${BLUE}Verifying migration...${NC}"

    VERIFIED=true

    if [[ -f "$OLD_DIR/neptune-core-settings.json" ]]; then
        if [[ -f "$NEW_DIR/neptune-core-settings.json" ]]; then
            echo -e "  ${GREEN}✓${NC} neptune-core-settings.json"
        else
            echo -e "  ${RED}✗${NC} neptune-core-settings.json (MISSING!)"
            VERIFIED=false
        fi
    fi

    if [[ -f "$OLD_DIR/address-book.json" ]]; then
        if [[ -f "$NEW_DIR/address-book.json" ]]; then
            echo -e "  ${GREEN}✓${NC} address-book.json"
        else
            echo -e "  ${RED}✗${NC} address-book.json (MISSING!)"
            VERIFIED=false
        fi
    fi

    echo ""

    if [[ "$VERIFIED" == true ]]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ✓ Migration completed successfully!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "  1. Start Neptune Core Wallet"
        echo "  2. Verify your settings and address book"
        echo "  3. If everything works, you can delete the old directory:"
        echo ""
        echo -e "     ${YELLOW}rm -rf \"$OLD_DIR\"${NC}"
        echo ""
    else
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}  ✗ Migration verification failed!${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Some files may be missing. Please check manually."
        exit 1
    fi
else
    echo -e "${RED}✗ Migration failed!${NC}"
    echo ""
    echo "Please check file permissions and try again."
    exit 1
fi

