# AGENTS.md

## Project Overview

Neptune Core Wallet is an Electron-based desktop wallet for the Neptune blockchain. Built with TypeScript, React, and modern web technologies, it provides a secure and user-friendly interface for managing Neptune cryptocurrency.

### Neptune Blockchain

Neptune is a **privacy-preserving, quantum-resistant, zk-STARKs-based L1 blockchain** that provides:

- **Privacy-preserving transactions** with advanced cryptographic techniques
- **Quantum resistance** to protect against future quantum computing threats
- **zk-STARKs technology** for scalable, transparent, and secure proof systems
- **Layer 1 blockchain** with native smart contract capabilities

### Architecture

- **Main Process**: Node.js backend handling blockchain operations, IPC, and system integration
- **Renderer Process**: React frontend with TanStack Router for navigation
- **Preload Scripts**: Secure context bridge for IPC communication
- **State Management**: Zustand for global state, React hooks for local state

## Setup Commands

### Development Environment

- Install dependencies: `pnpm install`
- Start development server: `pnpm start`
- Build for production: `pnpm make`
- Package application: `pnpm package`

### Code Quality

- Format code: `pnpm format`
- Lint code: `pnpm lint`
- Check all (format + lint): `pnpm check`
- Pre-commit check: `pnpm pre-commit`
- CI check: `pnpm ci`

## Code Style

### TypeScript Configuration

- **Strict mode enabled** - all strict TypeScript checks active
- **No implicit any** - explicit typing required
- **ESNext target** with modern module resolution
- **Path aliases** - use `@/*` for src imports

### Naming Conventions

- **Classes/Interfaces/Types**: `UpperCamelCase`
- **Variables/Functions/Methods**: `lowerCamelCase`
- **Constants**: `CONSTANT_CASE`
- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components
- **Private fields**: Use `private` keyword, NOT `#private` or `_prefix`

### Code Organization

- **One main export per file** - avoid file proliferation
- **Barrel exports** for clean imports (`index.ts` files)
- **Clear separation of concerns** - each module has single responsibility
- **DRY principle** - eliminate code duplication
- **KISS principle** - prefer simple, readable solutions
- **Consistent patterns** - follow established conventions in the codebase

## Development Guidelines

### Project Overview as Decision Framework

> **🎯 GUIDING PRINCIPLE**: Use the Project Overview above as the primary framework for all development decisions. Every choice should align with Neptune's privacy-preserving, quantum-resistant, zk-STARKs-based blockchain technology and the Electron desktop wallet architecture.

**Decision-Making Framework:**

- **Blockchain Alignment**: Ensure all features support Neptune's privacy-preserving and quantum-resistant capabilities
- **Architecture Consistency**: Maintain clear separation between Main Process, Renderer Process, and Preload Scripts
- **Technology Stack**: Leverage TypeScript, React, TanStack Router, and Zustand as specified
- **Performance & Security**: Prioritize both performance optimization and security hardening in every implementation
- **User Experience**: Design for desktop wallet users who value privacy, security, and ease of use

### Cursor Rules Compliance

> **📋 MANDATORY**: This project uses Cursor rules located at `.cursor/rules/` for consistent development practices. **ALL development work MUST adhere to these rules at all times.**

**Required Rule Files:**

- **`.cursor/rules/etiquette.mdc`** - Development etiquette and workflow guidelines
- **`.cursor/rules/ts-styleguide.mdc`** - TypeScript style guide and best practices
- **`.cursor/rules/semver.mdc`** - Semantic versioning rules and conventions

**Compliance Requirements:**

- **Read and understand** all rule files before starting any development work
- **Apply rules consistently** across all code, documentation, and processes
- **Reference rules** when making architectural or style decisions
- **Validate compliance** before completing any task or submitting changes
- **Escalate conflicts** between rules and requirements for resolution

### File Management

- **Edit existing files** rather than creating new ones when possible
- **Clean up after amendments** - remove unused imports, variables, and artifacts
- **No unused artifacts** - ensure all code serves a purpose
- **Minimal documentation** - only create docs when explicitly requested or absolutely necessary
- **Consolidate related functionality** - avoid file proliferation

### Electron-Specific Patterns

- **Maintain IPC boundaries** - don't mix main/renderer concerns
- **Use proper context isolation** in preload scripts
- **Handle process lifecycle** correctly
- **Respect security constraints** of Electron

### State Management

- **Zustand stores** with proper typing for global state
- **React hooks** for local component state
- **Immutable updates** for state changes
- **Type-safe selectors** for derived state

### API Integration

- **RPC calls** with proper error handling and retry logic
- **Request/response types** defined with TypeScript
- **Input validation** using Zod schemas
- **Structured logging** with Pino

### Communication Guidelines

- **Ask for confirmation** before making significant code amendments
- **Explain the approach** and get approval for implementation plans
- **Stay focused** on the current topic - don't race ahead to future features
- **Complete current task** before moving to the next
- **Don't implement unrequested features** without explicit discussion
- **Provide clear feedback** on what was changed and why
- **Reference Project Overview** when explaining decisions and architectural choices
- **Justify solutions** based on Neptune's blockchain technology and desktop wallet requirements
- **Cite Cursor Rules** when following specific guidelines from `.cursor/rules/` files
- **Confirm rule compliance** before presenting any changes or solutions

### Performance and Security Mindset

- **Always consider performance impact** of every change and optimization opportunity
- **Security-first approach** - validate all inputs, sanitize data, and follow secure coding practices
- **Memory management** - avoid memory leaks, clean up resources, and monitor memory usage
- **Network efficiency** - minimize RPC calls, implement proper caching, and use connection pooling
- **Cryptographic security** - handle private keys securely, use proper encryption, and validate signatures
- **Privacy preservation** - respect user privacy, minimize data collection, and secure data transmission

## Testing Instructions

### Test Structure

- **Unit tests** for individual functions and components
- **Integration tests** for IPC handlers and services
- **E2E tests** for critical user workflows
- **Test files** use `*.test.ts` or `*.spec.ts` naming

### Test Commands

- Run all tests: `pnpm test`
- Run specific test: `pnpm test -- --grep "test name"`
- Watch mode: `pnpm test -- --watch`
- Coverage report: `pnpm test -- --coverage`

### Test Requirements

- **Test edge cases** and error conditions
- **Verify user workflows** work end-to-end
- **Check backward compatibility** when making changes
- **Add tests for new code** - no untested features
- **Validate data integrity** in state changes

## Security Considerations

> **⚠️ CRITICAL**: Security is paramount in cryptocurrency applications. Every change must be evaluated for security implications.

### Electron Security

- **Context isolation** enabled in preload scripts
- **Node integration** disabled in renderer
- **Content Security Policy** implemented
- **Input validation** for all user inputs
- **Secure IPC** with typed handlers
- **Regular security audits** of dependencies and code

### Cryptocurrency Security

- **Private key protection** with encryption and secure key derivation
- **Secure storage** using electron-store with proper encryption
- **Transaction validation** before broadcasting with multiple checks
- **Network security** with proper RPC authentication and TLS
- **Quantum-resistant cryptography** where applicable
- **Zero-knowledge proof validation** for privacy-preserving transactions

### Privacy and Data Protection

- **Minimal data collection** - only collect what's absolutely necessary
- **Data encryption** at rest and in transit
- **User consent** for any data processing
- **Secure deletion** of sensitive data when no longer needed
- **Privacy-preserving protocols** for blockchain interactions

## Build and Deployment

### Build Process

- **Vite bundling** for renderer process
- **TypeScript compilation** for main process
- **Asset optimization** and code splitting
- **Cross-platform builds** for Windows, macOS, Linux

### Release Process

- **Semantic versioning** following SemVer 2.0.0
- **Automated builds** with GitHub Actions
- **Code signing** for distribution
- **Release notes** with changelog

## Common Patterns

### IPC Communication

```typescript
// Main process handler
ipcMain.handle("wallet:get-balance", async () => {
  return await walletService.getBalance();
});

// Renderer process call
const balance = await window.electronAPI.invoke("wallet:get-balance");
```

### Service Pattern

```typescript
class WalletService {
  private readonly rpcService: NeptuneRpcService;

  constructor(rpcService: NeptuneRpcService) {
    this.rpcService = rpcService;
  }

  public async getBalance(): Promise<Balance> {
    return await this.rpcService.call<Balance>("get_balance");
  }
}
```

### React Component Pattern

```typescript
interface WalletProps {
  address: string;
  onSend: (amount: string) => void;
}

function Wallet({ address, onSend }: WalletProps) {
  const [balance, setBalance] = useState<Balance | null>(null);

  useEffect(() => {
    // Fetch balance logic
  }, [address]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Error Handling

### Error Types

- **RpcError** for blockchain communication failures
- **ValidationError** for input validation failures
- **NetworkError** for connection issues
- **WalletError** for wallet-specific operations

### Error Recovery

- **Retry logic** with exponential backoff
- **Fallback behavior** when possible
- **User-friendly messages** for error display
- **Structured logging** for debugging
- **Handle errors gracefully** with appropriate user feedback
- **Log errors** with sufficient context for debugging

## Performance Guidelines

> **⚡ CRITICAL**: Performance directly impacts user experience in cryptocurrency applications. Every change must consider performance implications.

### Optimization Strategies

- **Lazy loading** for large components and routes
- **Memoization** for expensive calculations and API calls
- **Debouncing** for user input and search operations
- **Connection pooling** for RPC calls and network requests
- **Code splitting** to reduce initial bundle size
- **Caching strategies** for frequently accessed data
- **Batch operations** to minimize network round trips

### Memory Management

- **Cleanup resources** in useEffect and component unmount
- **Avoid memory leaks** in event listeners and subscriptions
- **Proper disposal** of IPC handlers and timers
- **Monitor memory usage** in development and production
- **Garbage collection optimization** for large datasets
- **Resource pooling** for expensive objects

### Network Performance

- **Request deduplication** to avoid duplicate API calls
- **Connection reuse** for RPC and HTTP requests
- **Compression** for large data transfers
- **Timeout handling** to prevent hanging requests
- **Retry strategies** with exponential backoff
- **Circuit breakers** for failing services

## Troubleshooting

### Decision-Making Process

When facing technical challenges or architectural decisions:

1. **Consult Project Overview** - Review the Neptune blockchain technology and Electron architecture
2. **Review Cursor Rules** - Check `.cursor/rules/` for applicable guidelines and constraints
3. **Evaluate against framework** - Ensure solutions align with privacy-preserving, quantum-resistant requirements
4. **Consider user context** - Desktop wallet users need security, performance, and ease of use
5. **Maintain architecture** - Preserve Main/Renderer/Preload separation and technology stack
6. **Prioritize security** - Every solution must enhance or maintain security posture
7. **Validate compliance** - Ensure all decisions follow established rules and guidelines

### Common Issues

- **IPC handler not found** - check handler registration
- **Type errors** - verify TypeScript configuration
- **Build failures** - check dependency versions
- **Runtime errors** - check console logs and error boundaries

### Debug Tools

- **Electron DevTools** for renderer debugging
- **Node.js debugging** for main process
- **React DevTools** for component inspection
- **Pino logging** for structured log analysis

## Contributing

### Pull Request Guidelines

- **Title format**: `[Component] Brief description`
- **Run checks**: `pnpm check` and `pnpm test` before committing
- **Update tests** for any code changes
- **Follow style guide** and naming conventions
- **Document breaking changes** in commit messages

### Code Review Checklist

- [ ] **Cursor rules compliance verified** - all `.cursor/rules/` files followed
- [ ] Code follows TypeScript style guide (`.cursor/rules/ts-styleguide.mdc`)
- [ ] Development etiquette followed (`.cursor/rules/etiquette.mdc`)
- [ ] Semantic versioning applied (`.cursor/rules/semver.mdc`)
- [ ] Tests pass and coverage is maintained
- [ ] No linting errors or warnings
- [ ] **Security considerations addressed** - input validation, data sanitization, secure storage
- [ ] **Performance impact considered** - memory usage, network efficiency, rendering optimization
- [ ] **Privacy implications evaluated** - data collection, user consent, data retention
- [ ] **Cryptographic security verified** - key handling, encryption, signature validation
- [ ] Documentation updated if needed
- [ ] Self-review completed before presenting changes
- [ ] Check for side effects that might impact other functionality
- [ ] Verify no breaking changes unless explicitly intended
- [ ] **Memory leaks prevented** - proper cleanup and resource disposal
- [ ] **Network efficiency optimized** - request batching, caching, connection reuse

---

_This AGENTS.md file provides comprehensive guidance for AI coding agents working on the Neptune Core Wallet project. For human contributors, see the main README.md file._
