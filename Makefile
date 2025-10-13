# ===========================================
# Neptune Core Wallet - Build System
# ===========================================
# 
# This Makefile provides a comprehensive build system for the Neptune Core Wallet
# Electron application, including development, packaging, and cleanup operations.
#
# Usage:
#   make help          - Show available targets
#   make dev           - Start development server
#   make build         - Build the application
#   make package       - Package the application
#   make make          - Create distributables (deb, rpm, AppImage)
#   make clean         - Clean all build artifacts
#   make clean-all     - Clean everything including node_modules
#   make test          - Run tests
#   make lint          - Run linting
#   make format        - Format code
#   make check         - Run all checks (format + lint)
#   make install       - Install dependencies
#   make update        - Update dependencies
#   make start         - Start the application (alias for dev)
#   make restart       - Restart main process (development)
#   make logs          - Show application logs
#   make status        - Show build status
#   make info          - Show project information
#
# ===========================================

# ===========================================
# Configuration
# ===========================================

# Project information
PROJECT_NAME := neptune-core-wallet
VERSION := $(shell node -p "require('./package.json').version")
PACKAGE_MANAGER := pnpm

# Directories
BUILD_DIR := out
DIST_DIR := dist
DIST_ELECTRON_BUILDER_DIR := dist-electron-builder
VITE_CACHE_DIR := .vite
NODE_MODULES_DIR := node_modules
TEST_RESULTS_DIR := test-results
TEST_SPAWNING_DIR := test-spawning
COVERAGE_DIR := coverage
LOGS_DIR := logs

# Build artifacts and temporary files
BUILD_ARTIFACTS := \
	$(BUILD_DIR) \
	$(DIST_DIR) \
	$(DIST_ELECTRON_BUILDER_DIR) \
	$(VITE_CACHE_DIR) \
	$(TEST_RESULTS_DIR) \
	$(TEST_SPAWNING_DIR) \
	$(COVERAGE_DIR) \
	$(LOGS_DIR) \
	*.log \
	*-*.log \
	spawn-test-*.log \
	library-dependency-check-*.log \
	privileged-spawning-test-*.log \
	*.tsbuildinfo \
	*.d.ts.map \
	.eslintcache \
	.stylelintcache \
	.cache \
	.tmp \
	.temp \
	tmp \
	temp

# Electron Forge targets
FORGE_TARGETS := deb rpm AppImage

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
RESET := \033[0m

# ===========================================
# Help Target
# ===========================================

.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)Neptune Core Wallet - Build System$(RESET)"
	@echo "$(CYAN)=====================================$(RESET)"
	@echo ""
	@echo "$(GREEN)Available targets:$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Examples:$(RESET)"
	@echo "  $(YELLOW)make dev$(RESET)           - Start development server"
	@echo "  $(YELLOW)make build$(RESET)         - Build the application"
	@echo "  $(YELLOW)make package$(RESET)       - Package the application"
	@echo "  $(YELLOW)make make$(RESET)          - Create distributables"
	@echo "  $(YELLOW)make clean$(RESET)         - Clean build artifacts"
	@echo "  $(YELLOW)make clean-all$(RESET)     - Clean everything"
	@echo ""

# ===========================================
# Development Targets
# ===========================================

.PHONY: dev start
dev start: ## Start development server
	@echo "$(GREEN)Starting development server...$(RESET)"
	$(PACKAGE_MANAGER) start

.PHONY: restart
restart: ## Restart main process (development)
	@echo "$(GREEN)Restarting main process...$(RESET)"
	@echo "Type 'rs' in the development terminal to restart"

.PHONY: logs
logs: ## Show application logs
	@echo "$(GREEN)Showing application logs...$(RESET)"
	@journalctl --user -f --since "5 minutes ago" | grep -E "(neptune|Neptune)" || echo "No recent logs found"

# ===========================================
# Build Targets
# ===========================================

.PHONY: build
build: ## Build the application
	@echo "$(GREEN)Building application...$(RESET)"
	$(PACKAGE_MANAGER) run build

.PHONY: package
package: ## Package the application
	@echo "$(GREEN)Packaging application...$(RESET)"
	$(PACKAGE_MANAGER) run package

.PHONY: make
make: ## Create distributables (deb, rpm, AppImage)
	@echo "$(GREEN)Creating distributables...$(RESET)"
	$(PACKAGE_MANAGER) run make

.PHONY: make-appimage
make-appimage: ## Create AppImage only
	@echo "$(GREEN)Creating AppImage...$(RESET)"
	$(PACKAGE_MANAGER) run make --targets=@electron-forge/maker-appimage

.PHONY: make-deb
make-deb: ## Create Debian package only
	@echo "$(GREEN)Creating Debian package...$(RESET)"
	$(PACKAGE_MANAGER) run make --targets=@electron-forge/maker-deb

.PHONY: make-rpm
make-rpm: ## Create RPM package only
	@echo "$(GREEN)Creating RPM package...$(RESET)"
	$(PACKAGE_MANAGER) run make --targets=@electron-forge/maker-rpm

# ===========================================
# Quality Assurance Targets
# ===========================================

.PHONY: test
test: ## Run tests
	@echo "$(GREEN)Running tests...$(RESET)"
	$(PACKAGE_MANAGER) test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(RESET)"
	$(PACKAGE_MANAGER) test -- --watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(RESET)"
	$(PACKAGE_MANAGER) test -- --coverage

.PHONY: lint
lint: ## Run linting
	@echo "$(GREEN)Running linting...$(RESET)"
	$(PACKAGE_MANAGER) run lint

.PHONY: format
format: ## Format code
	@echo "$(GREEN)Formatting code...$(RESET)"
	$(PACKAGE_MANAGER) run format

.PHONY: check
check: ## Run all checks (format + lint)
	@echo "$(GREEN)Running all checks...$(RESET)"
	$(PACKAGE_MANAGER) run check

.PHONY: pre-commit
pre-commit: ## Run pre-commit checks
	@echo "$(GREEN)Running pre-commit checks...$(RESET)"
	$(PACKAGE_MANAGER) run pre-commit

.PHONY: ci
ci: ## Run CI checks
	@echo "$(GREEN)Running CI checks...$(RESET)"
	$(PACKAGE_MANAGER) run ci

# ===========================================
# Dependency Management
# ===========================================

.PHONY: install
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	$(PACKAGE_MANAGER) install

.PHONY: update
update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(RESET)"
	$(PACKAGE_MANAGER) update

.PHONY: outdated
outdated: ## Check for outdated dependencies
	@echo "$(GREEN)Checking for outdated dependencies...$(RESET)"
	$(PACKAGE_MANAGER) outdated

# ===========================================
# Cleanup Targets
# ===========================================

.PHONY: clean
clean: ## Clean build artifacts and temporary files
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	@for artifact in $(BUILD_ARTIFACTS); do \
		if [ -e "$$artifact" ]; then \
			echo "$(RED)Removing: $$artifact$(RESET)"; \
			rm -rf "$$artifact"; \
		fi; \
	done
	@echo "$(GREEN)Build artifacts cleaned!$(RESET)"

.PHONY: clean-build
clean-build: ## Clean only build directories
	@echo "$(YELLOW)Cleaning build directories...$(RESET)"
	@for dir in $(BUILD_DIR) $(DIST_DIR) $(DIST_ELECTRON_BUILDER_DIR); do \
		if [ -d "$$dir" ]; then \
			echo "$(RED)Removing: $$dir$(RESET)"; \
			rm -rf "$$dir"; \
		fi; \
	done
	@echo "$(GREEN)Build directories cleaned!$(RESET)"

.PHONY: clean-cache
clean-cache: ## Clean cache directories
	@echo "$(YELLOW)Cleaning cache directories...$(RESET)"
	@for dir in $(VITE_CACHE_DIR) .cache .tmp .temp tmp temp; do \
		if [ -d "$$dir" ]; then \
			echo "$(RED)Removing: $$dir$(RESET)"; \
			rm -rf "$$dir"; \
		fi; \
	done
	@echo "$(GREEN)Cache directories cleaned!$(RESET)"

.PHONY: clean-logs
clean-logs: ## Clean log files
	@echo "$(YELLOW)Cleaning log files...$(RESET)"
	@find . -name "*.log" -not -path "./$(NODE_MODULES_DIR)/*" -delete 2>/dev/null || true
	@echo "$(GREEN)Log files cleaned!$(RESET)"

.PHONY: clean-test
clean-test: ## Clean test artifacts
	@echo "$(YELLOW)Cleaning test artifacts...$(RESET)"
	@for dir in $(TEST_RESULTS_DIR) $(TEST_SPAWNING_DIR) $(COVERAGE_DIR); do \
		if [ -d "$$dir" ]; then \
			echo "$(RED)Removing: $$dir$(RESET)"; \
			rm -rf "$$dir"; \
		fi; \
	done
	@echo "$(GREEN)Test artifacts cleaned!$(RESET)"

.PHONY: clean-all
clean-all: clean ## Clean everything including node_modules
	@echo "$(YELLOW)Cleaning everything...$(RESET)"
	@if [ -d "$(NODE_MODULES_DIR)" ]; then \
		echo "$(RED)Removing: $(NODE_MODULES_DIR)$(RESET)"; \
		rm -rf "$(NODE_MODULES_DIR)"; \
	fi
	@echo "$(GREEN)Everything cleaned!$(RESET)"

# ===========================================
# Information Targets
# ===========================================

.PHONY: status
status: ## Show build status
	@echo "$(CYAN)Neptune Core Wallet - Build Status$(RESET)"
	@echo "$(CYAN)==================================$(RESET)"
	@echo ""
	@echo "$(GREEN)Project:$(RESET) $(PROJECT_NAME)"
	@echo "$(GREEN)Version:$(RESET) $(VERSION)"
	@echo "$(GREEN)Package Manager:$(RESET) $(PACKAGE_MANAGER)"
	@echo ""
	@echo "$(GREEN)Build Artifacts:$(RESET)"
	@for artifact in $(BUILD_ARTIFACTS); do \
		if [ -e "$$artifact" ]; then \
			echo "  $(RED)✗$(RESET) $$artifact"; \
		else \
			echo "  $(GREEN)✓$(RESET) $$artifact (clean)"; \
		fi; \
	done
	@echo ""
	@echo "$(GREEN)Dependencies:$(RESET)"
	@if [ -d "$(NODE_MODULES_DIR)" ]; then \
		echo "  $(GREEN)✓$(RESET) node_modules installed"; \
	else \
		echo "  $(RED)✗$(RESET) node_modules not found"; \
	fi

.PHONY: info
info: ## Show project information
	@echo "$(CYAN)Neptune Core Wallet - Project Information$(RESET)"
	@echo "$(CYAN)==========================================$(RESET)"
	@echo ""
	@echo "$(GREEN)Project:$(RESET) $(PROJECT_NAME)"
	@echo "$(GREEN)Version:$(RESET) $(VERSION)"
	@echo "$(GREEN)Package Manager:$(RESET) $(PACKAGE_MANAGER)"
	@echo "$(GREEN)Node Version:$(RESET) $(shell node --version)"
	@echo "$(GREEN)NPM Version:$(RESET) $(shell npm --version)"
	@echo "$(GREEN)PNPM Version:$(RESET) $(shell pnpm --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "$(GREEN)Available Scripts:$(RESET)"
	@echo "  $(YELLOW)dev$(RESET)           - Start development server"
	@echo "  $(YELLOW)build$(RESET)         - Build the application"
	@echo "  $(YELLOW)package$(RESET)       - Package the application"
	@echo "  $(YELLOW)make$(RESET)          - Create distributables"
	@echo "  $(YELLOW)test$(RESET)          - Run tests"
	@echo "  $(YELLOW)lint$(RESET)          - Run linting"
	@echo "  $(YELLOW)format$(RESET)        - Format code"
	@echo "  $(YELLOW)check$(RESET)         - Run all checks"
	@echo ""
	@echo "$(GREEN)Build Targets:$(RESET)"
	@for target in $(FORGE_TARGETS); do \
		echo "  $(YELLOW)$$target$(RESET)"; \
	done

# ===========================================
# Utility Targets
# ===========================================

.PHONY: size
size: ## Show project size
	@echo "$(GREEN)Project size analysis:$(RESET)"
	@echo ""
	@echo "$(YELLOW)Source code:$(RESET)"
	@du -sh src/ 2>/dev/null || echo "  src/ not found"
	@echo ""
	@echo "$(YELLOW)Dependencies:$(RESET)"
	@du -sh $(NODE_MODULES_DIR)/ 2>/dev/null || echo "  $(NODE_MODULES_DIR)/ not found"
	@echo ""
	@echo "$(YELLOW)Build artifacts:$(RESET)"
	@for dir in $(BUILD_DIR) $(DIST_DIR) $(DIST_ELECTRON_BUILDER_DIR); do \
		if [ -d "$$dir" ]; then \
			du -sh "$$dir"; \
		fi; \
	done

.PHONY: deps
deps: ## Show dependency information
	@echo "$(GREEN)Dependency information:$(RESET)"
	@echo ""
	@echo "$(YELLOW)Total dependencies:$(RESET)"
	@$(PACKAGE_MANAGER) list --depth=0 2>/dev/null | wc -l || echo "Unable to count dependencies"
	@echo ""
	@echo "$(YELLOW)Outdated dependencies:$(RESET)"
	@$(PACKAGE_MANAGER) outdated 2>/dev/null | wc -l || echo "Unable to check outdated dependencies"

# ===========================================
# Default Target
# ===========================================

.DEFAULT_GOAL := help

# ===========================================
# Special Targets
# ===========================================

# Prevent make from treating targets as files
.PHONY: $(shell awk -F: '/^[a-zA-Z_-]+:/ {print $$1}' $(MAKEFILE_LIST))
