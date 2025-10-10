# Recommended NPM Packages

This document outlines recommended NPM packages for process management, state management, and other utilities within our Electron application.

## Process Spawning & Execution

### 1. **execa** ⭐ (Recommended)
```bash
npm install execa
```

**Description**: Modern, promise-based process spawning with better error handling and cross-platform support.

**Features**:
- Promise-based API (better than raw `child_process`)
- Cross-platform compatibility
- TypeScript support
- Better error handling
- Automatic shell escaping
- Built-in timeout support

**Use Case**: Primary choice for spawning Neptune Core and CLI binaries.

**Example**:
```typescript
import { execa } from 'execa';

// Spawn a process
const process = execa('neptune-core', ['--network', 'testnet', '--rpc-port', '9800']);

// Handle lifecycle
process.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Kill process gracefully
await process.kill('SIGTERM');
```

**Pros**:
- Modern, clean API
- Excellent TypeScript support
- Better error handling than raw `child_process`
- Cross-platform
- Lightweight

**Cons**:
- No built-in lifecycle management
- Requires manual process tracking

---

### 2. **cross-spawn**
```bash
npm install cross-spawn
```

**Description**: Cross-platform process spawning that works consistently across Windows, Mac, and Linux.

**Features**:
- Cross-platform compatibility
- Lightweight
- Simple API
- Works with `child_process.spawn`

**Use Case**: Alternative to `execa` if you prefer the raw `child_process` API.

**Example**:
```typescript
import spawn from 'cross-spawn';

const process = spawn('neptune-core', ['--network', 'testnet'], {
  stdio: ['ignore', 'pipe', 'pipe']
});
```

**Pros**:
- Cross-platform
- Lightweight
- Simple

**Cons**:
- Basic functionality
- No promise support
- Manual error handling

---

### 3. **node-pty**
```bash
npm install node-pty
```

**Description**: Pseudo-terminal (PTY) support for Node.js, great for interactive CLI tools.

**Features**:
- Pseudo-terminal support
- Interactive process handling
- Terminal emulation
- Great for CLI tools

**Use Case**: If Neptune CLI requires interactive terminal features.

**Example**:
```typescript
import { spawn } from 'node-pty';

const process = spawn('neptune-cli', ['--interactive'], {
  name: 'xterm-color',
  cols: 80,
  rows: 30
});
```

**Pros**:
- Great for interactive processes
- Terminal emulation
- Cross-platform

**Cons**:
- More complex
- Overkill for simple spawning
- Larger bundle size

---

## Resilience & Async Utilities

### 4. **p-retry** ⭐ (Recommended)
```bash
npm install p-retry
```

**Description**: Retry a promise-returning or async function with exponential backoff and jitter.

**Features**:
- Exponential backoff with configurable factor
- Jitter support to prevent thundering herd
- Custom retry conditions
- Promise-based API
- TypeScript support
- Battle-tested by thousands of projects

**Use Case**: Retry failed process spawns, API calls, or any async operations.

**Example**:
```typescript
import pRetry from 'p-retry';

const spawnWithRetry = () => pRetry(
  () => spawnNeptuneCore(),
  {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
    onFailedAttempt: (error) => {
      console.log(`Attempt ${error.attemptNumber} failed: ${error.message}`);
    }
  }
);
```

**Pros**:
- Lightweight and focused
- Excellent error handling
- Configurable retry strategies
- Zero dependencies

**Cons**:
- No built-in circuit breaker
- Manual configuration required

---

### 5. **p-timeout** ⭐ (Recommended)
```bash
npm install p-timeout
```

**Description**: Timeout a promise after a specified amount of time with AbortSignal support.

**Features**:
- Promise timeout with custom error messages
- AbortSignal support for cancellation
- Clean error handling
- TypeScript support
- Lightweight implementation

**Use Case**: Add timeouts to process operations, API calls, or any async operations.

**Example**:
```typescript
import pTimeout from 'p-timeout';

const spawnWithTimeout = () => pTimeout(
  spawnNeptuneCore(),
  30000, // 30 seconds
  'Process spawn timeout'
);

// With AbortSignal
const controller = new AbortController();
const data = await pTimeout(
  fetchData(),
  5000,
  'Request timeout',
  { signal: controller.signal }
);
```

**Pros**:
- Simple and reliable
- AbortSignal integration
- Custom error messages
- Zero dependencies

**Cons**:
- Basic functionality only
- No advanced timeout strategies

---

### 6. **p-limit** ⭐ (Recommended)
```bash
npm install p-limit
```

**Description**: Run multiple promise-returning & async functions with limited concurrency.

**Features**:
- Concurrency control
- Promise-based API
- Lightweight
- TypeScript support
- Active queue management

**Use Case**: Limit the number of concurrent processes, API calls, or resource-intensive operations.

**Example**:
```typescript
import pLimit from 'p-limit';

const limit = pLimit(2); // Max 2 concurrent operations

const processes = [
  limit(() => spawnNeptuneCore()),
  limit(() => spawnNeptuneCli()),
  limit(() => spawnAnotherProcess())
];

await Promise.all(processes);

// Dynamic concurrency
const dynamicLimit = pLimit(process.env.NODE_ENV === 'production' ? 5 : 2);
```

**Pros**:
- Simple concurrency control
- Promise-based
- Lightweight
- Zero dependencies

**Cons**:
- Basic queue management
- No priority support

---

### 7. **p-queue** ⭐ (Advanced)
```bash
npm install p-queue
```

**Description**: Advanced promise queue with concurrency control, priority, and interval management.

**Features**:
- Concurrency control
- Priority queue support
- Interval management (rate limiting)
- Pause/resume functionality
- Event emission
- TypeScript support

**Use Case**: Advanced queue management for complex async operations with priorities and rate limiting.

**Example**:
```typescript
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 3,
  interval: 1000, // 1 second
  intervalCap: 2, // 2 operations per interval
  priority: 1 // default priority
});

// Add with priority
await queue.add(() => highPriorityOperation(), { priority: 10 });
await queue.add(() => lowPriorityOperation(), { priority: 1 });

// Pause/resume
queue.pause();
queue.start();
```

**Pros**:
- Advanced queue features
- Priority support
- Rate limiting
- Event system
- Pause/resume

**Cons**:
- More complex than p-limit
- Larger bundle size

---

## **p-* Suite Integration** ⭐ (Recommended Approach)

The `p-*` packages work excellently together and can replace our custom resilience utilities:

### Installation
```bash
npm install p-retry p-timeout p-limit p-queue
```

### Combined Example
```typescript
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import pLimit from 'p-limit';
import PQueue from 'p-queue';

export class ResilientProcessManager {
  private queue = new PQueue({ concurrency: 2 });
  private limit = pLimit(3);

  async spawnProcess(name: string, command: string, args: string[]) {
    return this.queue.add(() =>
      this.limit(() =>
        pRetry(
          () => pTimeout(
            execa(command, args),
            30000,
            'Process spawn timeout'
          ),
          {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000
          }
        )
      )
    );
  }
}
```

### Migration from Custom Utilities
```typescript
// Before (custom resilience utilities)
import { retryAsync, withTimeout } from '@/utils/resilience';

const result = await retryAsync(() => fetchData(), { retries: 3 });
const data = await withTimeout(fetchData(), { timeoutMs: 5000 });

// After (p-* packages)
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';

const result = await pRetry(() => fetchData(), { retries: 3 });
const data = await pTimeout(fetchData(), 5000);
```

---

## Process Monitoring & Health Checks

### 7. **pidusage**
```bash
npm install pidusage
```

**Description**: Get process usage statistics (CPU, memory) by PID.

**Features**:
- CPU usage monitoring
- Memory usage monitoring
- Cross-platform
- Lightweight

**Use Case**: Monitor Neptune Core and CLI resource usage.

**Example**:
```typescript
import pidusage from 'pidusage';

const stats = await pidusage(process.pid);
console.log('CPU:', stats.cpu, 'Memory:', stats.memory);
```

---

### 8. **is-running**
```bash
npm install is-running
```

**Description**: Check if a process is running by PID.

**Features**:
- Simple PID checking
- Cross-platform
- Lightweight
- Promise support

**Use Case**: Health checks for spawned processes.

**Example**:
```typescript
import isRunning from 'is-running';

const isProcessAlive = await isRunning(process.pid);
```

---

## State Management

### **Zustand** ⭐ (Currently Used - Recommended)
```bash
npm install zustand
```

**Description**: Lightweight, modern state management library that replaces `useState` with a more powerful and scalable solution.

**Features**:
- **Minimal boilerplate** - Simple API, easy to learn
- **High performance** - Minimal re-renders, optimized
- **TypeScript support** - Excellent type safety
- **Small bundle size** - ~2KB gzipped
- **Active maintenance** - Regular updates, great community
- **40M+ weekly downloads** - Most popular state management library
- **40k+ GitHub stars** - Battle-tested by thousands of projects

**Use Case**: Replace `useState` for complex state management, global state, and cross-component state sharing.

**Example**:
```typescript
import { create } from 'zustand';

// Simple store
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Usage in component
function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// Advanced store with persistence
const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      reset: () => set({ theme: 'dark', language: 'en' }),
    }),
    { name: 'settings-storage' }
  )
);
```

**Pros**:
- **Most popular** - Widely adopted, excellent community
- **Zero learning curve** - Simple API, easy migration from `useState`
- **High performance** - Optimized re-renders, minimal bundle impact
- **TypeScript first** - Excellent type safety and inference
- **Composable** - Easy to combine and split stores
- **Persistence support** - Built-in localStorage/sessionStorage integration
- **DevTools support** - Redux DevTools integration

**Cons**:
- **No built-in middleware** - Requires additional packages for advanced features
- **Manual optimization** - Need to be careful with selectors for performance

---

### **Alternative Options** (Not Recommended - You Already Have Zustand)

#### **Redux Toolkit** (Enterprise Alternative)
```bash
npm install @reduxjs/toolkit react-redux
```

**Description**: The official, opinionated, batteries-included toolset for efficient Redux development.

**Why Not Recommended**:
- **Overkill for your project** - Zustand is already working well
- **Larger bundle size** - ~15KB vs Zustand's ~2KB
- **More complex** - Steeper learning curve
- **Migration overhead** - Would require rewriting existing stores

#### **Jotai** (Modern Alternative)
```bash
npm install jotai
```

**Description**: Primitive and flexible state management for React with atomic approach.

**Why Not Recommended**:
- **Different paradigm** - Atomic approach vs traditional stores
- **Migration complexity** - Would require significant refactoring
- **Zustand is sufficient** - Your current needs are well met

---

## **State Management Migration Guide**

### **From useState to Zustand**

```typescript
// Before (useState)
const [count, setCount] = useState(0);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const increment = () => setCount(c => c + 1);
const decrement = () => setCount(c => c - 1);
const reset = () => setCount(0);

// After (Zustand)
const useCounterStore = create((set) => ({
  count: 0,
  loading: false,
  error: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Usage
const { count, loading, error, increment, decrement, reset } = useCounterStore();
```

### **Benefits of Migration**
- **Remove prop drilling** - Access state from any component
- **Better performance** - Only re-render when specific state changes
- **Easier testing** - Store logic is separate from components
- **Persistence** - Easy to add localStorage/sessionStorage
- **DevTools** - Better debugging with Redux DevTools
- **Type safety** - Better TypeScript support than useState

---

## Electron-Specific Packages

### 12. **electron-re**
```bash
npm install electron-re
```

**Description**: Process manager and utilities for Electron applications.

**Features**:
- Process manager UI
- Child process pool
- Process monitoring
- Electron-specific

**Use Case**: If you need a UI for process management.

**Example**:
```typescript
import { ProcessManager, ChildProcessPool } from 'electron-re';

const pool = new ChildProcessPool();
const manager = new ProcessManager();
```

---

## Recommended Implementation

For our Neptune Wallet application, we recommend:

1. **Process Spawning**: `execa` for modern process management
2. **Resilience**: `p-retry`, `p-timeout`, `p-limit`, `p-queue` suite
3. **State Management**: `zustand` for replacing `useState`
4. **Monitoring**: `pidusage` for resource monitoring
5. **Health checks**: `is-running` for process status

### Installation
```bash
# Core packages
npm install execa p-retry p-timeout p-limit p-queue pidusage is-running

# Logging
npm install pino pino-pretty

# Settings management
npm install electron-store

# Error tracking
npm install @sentry/electron

# Caching
npm install node-cache lru-cache

# HTTP client
npm install ky  # or axios

# Crypto & security
npm install bcrypt argon2

# File system
npm install fs-extra

# String & data utilities
npm install dompurify validator

# Testing
npm install vitest @testing-library/react @testing-library/jest-dom

# State management (already installed)
# npm install zustand  # ✅ Already installed and working

# Validation (already installed)
# npm install zod @hookform/resolvers/zod  # ✅ Already installed

# Date utilities (already installed)
# npm install date-fns  # ✅ Already installed and working
```

### Example Integration
```typescript
import { execa } from 'execa';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import pLimit from 'p-limit';
import PQueue from 'p-queue';
import { create } from 'zustand';
import pidusage from 'pidusage';
import isRunning from 'is-running';
import pino from 'pino';

// State management with Zustand
const useProcessStore = create((set, get) => ({
  processes: new Map(),
  queueStatus: { pending: 0, size: 0, isPaused: false },

  addProcess: (name, process) => set((state) => {
    const newProcesses = new Map(state.processes);
    newProcesses.set(name, process);
    return { processes: newProcesses };
  }),

  removeProcess: (name) => set((state) => {
    const newProcesses = new Map(state.processes);
    newProcesses.delete(name);
    return { processes: newProcesses };
  }),

  updateQueueStatus: (status) => set({ queueStatus: status }),
}));

export class ResilientProcessManager {
  private queue = new PQueue({ concurrency: 2 });
  private limit = pLimit(3);
  private logger = pino({ level: 'info' });

  async spawnProcess(name: string, command: string, args: string[]) {
    const process = await this.queue.add(() =>
      this.limit(() =>
        pRetry(
          () => pTimeout(
            execa(command, args),
            30000,
            'Process spawn timeout'
          ),
          {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
            onFailedAttempt: (error) => {
              this.logger.warn({
                attempt: error.attemptNumber,
                error: error.message,
                process: name
              }, 'Spawn attempt failed');
            }
          }
        )
      )
    );

    this.logger.info({
      process: name,
      pid: process.pid,
      command: `${command} ${args.join(' ')}`
    }, 'Process spawned successfully');

    // Update Zustand store
    useProcessStore.getState().addProcess(name, process);
    return process;
  }

  async getProcessStats(name: string) {
    const processes = useProcessStore.getState().processes;
    const process = processes.get(name);
    if (!process?.pid) return null;

    return {
      isRunning: await isRunning(process.pid),
      stats: await pidusage(process.pid)
    };
  }

  // Advanced queue management
  pauseQueue() {
    this.queue.pause();
    useProcessStore.getState().updateQueueStatus({
      pending: this.queue.pending,
      size: this.queue.size,
      isPaused: this.queue.isPaused
    });
  }

  resumeQueue() {
    this.queue.start();
    useProcessStore.getState().updateQueueStatus({
      pending: this.queue.pending,
      size: this.queue.size,
      isPaused: this.queue.isPaused
    });
  }

  getQueueStatus() {
    return useProcessStore.getState().queueStatus;
  }
}

// Usage in React components
function ProcessMonitor() {
  const { processes, queueStatus } = useProcessStore();

  return (
    <div>
      <h3>Processes: {processes.size}</h3>
      <h3>Queue: {queueStatus.pending} pending, {queueStatus.size} queued</h3>
    </div>
  );
}
```

---

## Settings Management

### electron-store
**Description**: Simple data persistence for Electron apps using JSON files
**Weekly Downloads**: 200k+
**GitHub Stars**: 6k+
**Features**:
- Automatic file handling (JSON, YAML, TOML)
- TypeScript support with type inference
- Schema validation with Zod integration
- Automatic migrations and versioning
- Cross-platform path handling
- Built-in caching and performance optimization

**Use Cases**:
- Replace custom SettingsService
- User preferences and configuration
- App state persistence
- Settings migration between versions

**Example**:
```typescript
import Store from 'electron-store';
import { z } from 'zod';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'neptune']),
  language: z.string(),
  autoUpdate: z.boolean(),
});

const store = new Store({
  schema: {
    general: settingsSchema,
    security: z.object({ /* security settings */ }),
  },
  migrations: {
    '2.0.0': (store) => {
      // Migration logic
    },
  },
});

// Usage
store.set('general.theme', 'neptune');
const theme = store.get('general.theme');
```

**Pros**:
- Zero configuration
- Automatic type safety
- Built-in validation
- Migration support
- Performance optimized

**Cons**:
- Electron-specific (not universal)
- File-based only (no database support)

### conf
**Description**: Simple config management for Node.js applications
**Weekly Downloads**: 2M+
**GitHub Stars**: 1.5k+
**Features**:
- Cross-platform configuration
- TypeScript support
- Schema validation
- Encryption support
- Multiple storage backends

**Use Cases**:
- Universal config management
- CLI tool configuration
- Application settings
- User preferences

**Example**:
```typescript
import Conf from 'conf';
import { z } from 'zod';

const config = new Conf({
  schema: {
    theme: z.enum(['light', 'dark', 'neptune']),
    language: z.string(),
  },
  encryptionKey: 'your-encryption-key',
});

config.set('theme', 'neptune');
const theme = config.get('theme');
```

**Pros**:
- Universal (not Electron-specific)
- Encryption support
- Multiple backends
- Lightweight

**Cons**:
- No built-in migrations
- Less Electron integration

---

## Logging

### Pino ⭐ (Recommended)
**Description**: Fast and lightweight JSON logger for Node.js applications
**Weekly Downloads**: 2M+
**GitHub Stars**: 12k+
**Features**:
- **Extremely fast** - designed for high performance
- **JSON-first logging** - structured logging by default
- **Asynchronous logging** - non-blocking by default
- **Child loggers** - create contextual loggers
- **Multiple transports** - console, file, remote
- **Pretty printing** - human-readable development output
- **TypeScript support** - excellent type definitions
- **Low overhead** - minimal performance impact

**Use Cases**:
- Replace custom logging utilities
- High-performance applications
- Production logging
- Structured logging for analysis
- Process monitoring and debugging

**Example**:
```typescript
import pino from 'pino';

// Basic logger
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

// Usage
logger.info('Process started', { pid: process.pid, port: 3000 });
logger.error('Operation failed', { error: error.message, context: 'wallet' });

// Child logger with context
const walletLogger = logger.child({ component: 'wallet' });
walletLogger.info('Balance updated', { balance: 1000, currency: 'NPT' });

// Async logging (non-blocking)
logger.info({ userId: 123, action: 'login' }, 'User logged in');
```

**Pros**:
- **Fastest performance** - significantly faster than Winston
- **Structured logging** - JSON format for easy parsing
- **Asynchronous** - non-blocking by default
- **Lightweight** - minimal bundle size
- **Great TypeScript support** - excellent type definitions
- **Active maintenance** - regular updates and bug fixes
- **Ecosystem** - many plugins and transports

**Cons**:
- **JSON-only** - not as human-readable as Winston
- **Learning curve** - different API than Winston
- **Less flexible** - fewer configuration options than Winston

### Winston (Alternative)
**Description**: Multi-transport async logging library for Node.js
**Weekly Downloads**: 4M+
**GitHub Stars**: 20k+
**Features**:
- Multiple transports (console, file, database, etc.)
- Log levels and formatting
- Query and filtering capabilities
- Exception handling
- Profiling support

**Why Not Recommended**:
- **Slower than Pino** - significant performance difference
- **More complex** - steeper learning curve
- **Synchronous by default** - can block the event loop
- **Larger bundle size** - more overhead than Pino

---

## Error Tracking & Monitoring

### @sentry/electron
**Description**: Official Sentry SDK for Electron applications
**Weekly Downloads**: 50k+
**GitHub Stars**: 1k+
**Features**:
- Automatic error collection
- Performance monitoring
- User session tracking
- Release tracking
- Source map support
- Custom error context

**Use Cases**:
- Replace custom error handling
- Production error monitoring
- Performance tracking
- User experience monitoring

**Example**:
```typescript
import * as Sentry from '@sentry/electron/main';

Sentry.init({
  dsn: 'YOUR_DSN_HERE',
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
});

// Automatic error capture
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}

// Custom context
Sentry.setUser({ id: 'user123', email: 'user@example.com' });
Sentry.setTag('feature', 'wallet');
Sentry.setContext('wallet', { balance: 1000 });
```

**Pros**:
- Production-ready
- Automatic error collection
- Rich context and metadata
- Performance monitoring
- Team collaboration features

**Cons**:
- Requires external service
- Can be expensive at scale
- Privacy considerations

---

## Caching

### node-cache
**Description**: Simple and fast Node.js internal caching
**Weekly Downloads**: 1M+
**GitHub Stars**: 2k+
**Features**:
- In-memory caching
- TTL support
- Statistics tracking
- Event system
- Clustering support

**Use Cases**:
- Replace custom LevelDB caching
- Application-level caching
- Session storage
- Temporary data storage

**Example**:
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // 2 minutes
  useClones: false,
});

// Set with TTL
cache.set('user:123', { name: 'John' }, 300);

// Get with fallback
const user = cache.get('user:123') || await fetchUserFromDB();

// Statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hits / (stats.hits + stats.misses) * 100}%`);
```

**Pros**:
- Simple API
- Built-in statistics
- Event system
- Clustering support
- Zero dependencies

**Cons**:
- In-memory only
- No persistence
- Limited scalability

### lru-cache
**Description**: Fast, efficient LRU cache implementation
**Weekly Downloads**: 50M+
**GitHub Stars**: 1k+
**Features**:
- LRU eviction policy
- Size-based limits
- TTL support
- TypeScript support
- High performance

**Use Cases**:
- High-performance caching
- Memory-constrained environments
- Frequently accessed data
- Cache with size limits

**Example**:
```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
});

cache.set('key', { data: 'value' });
const value = cache.get('key');
```

**Pros**:
- Extremely fast
- Memory efficient
- Size-based limits
- Well-tested

**Cons**:
- Basic API
- No persistence
- No statistics

---

## HTTP Client

### ky
**Description**: Tiny and elegant HTTP client based on the browser Fetch API
**Weekly Downloads**: 2M+
**GitHub Stars**: 8k+
**Features**:
- Built on fetch API
- Automatic JSON parsing
- Request/response hooks
- Timeout support
- Retry functionality
- TypeScript support

**Use Cases**:
- Replace custom fetch implementations
- API client for Neptune RPC
- Better error handling than raw fetch

**Example**:
```typescript
import ky from 'ky';

const api = ky.create({
  prefixUrl: 'http://localhost:9800',
  timeout: 30000,
  retry: {
    limit: 3,
    methods: ['get', 'post'],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Cookie', `neptune-cli=${cookie}`);
      },
    ],
  },
});

// Usage
const response = await api.post('', {
  json: { method: 'wallet_status', params: {}, id: 1 }
}).json();
```

**Pros**:
- Lightweight and modern
- Built-in retry and timeout
- TypeScript first
- Hooks system

**Cons**:
- Newer library
- Smaller ecosystem than axios

### axios
**Description**: Promise-based HTTP client for the browser and node.js
**Weekly Downloads**: 50M+
**GitHub Stars**: 100k+
**Features**:
- Request/response interceptors
- Automatic JSON data transformation
- Request timeout
- Built-in retry
- Wide browser support

**Use Cases**:
- Replace custom fetch implementations
- Robust HTTP client
- Interceptor support

**Example**:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9800',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  config.headers.Cookie = `neptune-cli=${cookie}`;
  return config;
});

// Usage
const response = await api.post('', {
  method: 'wallet_status',
  params: {},
  id: 1
});
```

**Pros**:
- Most popular HTTP client
- Rich feature set
- Excellent TypeScript support
- Mature and stable

**Cons**:
- Larger bundle size
- More complex than ky

---

## Crypto & Security

### bcrypt
**Description**: A library to help you hash passwords
**Weekly Downloads**: 2M+
**GitHub Stars**: 6k+
**Features**:
- Secure password hashing
- Salt generation
- Configurable rounds
- Cross-platform

**Use Cases**:
- Replace custom password hashing
- Secure password storage
- Password verification

**Example**:
```typescript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Pros**:
- Industry standard
- Battle-tested
- Secure by default
- Simple API

**Cons**:
- CPU intensive
- No built-in key derivation

### argon2
**Description**: The password hash Argon2, winner of PHC
**Weekly Downloads**: 100k+
**GitHub Stars**: 1k+
**Features**:
- Winner of Password Hashing Competition
- Memory-hard function
- Configurable parameters
- Better than bcrypt for new projects

**Use Cases**:
- Modern password hashing
- Key derivation
- Memory-hard hashing

**Example**:
```typescript
import argon2 from 'argon2';

// Hash password
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
});

// Verify password
const isValid = await argon2.verify(hash, password);
```

**Pros**:
- More secure than bcrypt
- Memory-hard
- Configurable
- Modern standard

**Cons**:
- Newer than bcrypt
- More complex configuration

---

## File System

### fs-extra
**Description**: fs-extra contains methods that aren't included in the vanilla Node.js fs package
**Weekly Downloads**: 20M+
**GitHub Stars**: 9k+
**Features**:
- Promise-based file system operations
- Directory operations
- File copying and moving
- Path utilities
- JSON file operations

**Use Cases**:
- Replace custom file operations
- Directory management
- File copying/moving
- JSON file handling

**Example**:
```typescript
import fs from 'fs-extra';

// Ensure directory exists
await fs.ensureDir('/path/to/directory');

// Copy file
await fs.copy('/source/file', '/dest/file');

// Read JSON
const data = await fs.readJson('/path/to/file.json');

// Write JSON
await fs.writeJson('/path/to/file.json', data, { spaces: 2 });
```

**Pros**:
- Promise-based
- Additional utilities
- Well-tested
- Drop-in replacement for fs

**Cons**:
- Additional dependency
- Some methods overlap with Node.js

---

## String & Data Utilities

### dompurify
**Description**: DOMPurify - a DOM-only, super-fast, uber-tolerant XSS sanitizer
**Weekly Downloads**: 2M+
**GitHub Stars**: 10k+
**Features**:
- XSS sanitization
- HTML sanitization
- Configurable policies
- Fast and secure

**Use Cases**:
- Replace custom HTML sanitization
- XSS prevention
- User input sanitization

**Example**:
```typescript
import DOMPurify from 'dompurify';

// Sanitize HTML
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
  ALLOWED_ATTR: ['href']
});

// Sanitize for text content
const text = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
```

**Pros**:
- Industry standard
- Fast and secure
- Configurable
- Well-maintained

**Cons**:
- Browser-focused
- May be overkill for simple cases

### validator
**Description**: A library of string validators and sanitizers
**Weekly Downloads**: 20M+
**GitHub Stars**: 8k+
**Features**:
- String validation
- Email validation
- URL validation
- Sanitization
- TypeScript support

**Use Cases**:
- Replace custom validation
- Input validation
- Data sanitization

**Example**:
```typescript
import validator from 'validator';

// Validation
const isEmail = validator.isEmail('test@example.com');
const isURL = validator.isURL('https://example.com');

// Sanitization
const clean = validator.escape('<script>alert("xss")</script>');
const trimmed = validator.trim('  hello world  ');
```

**Pros**:
- Comprehensive validation
- Well-tested
- TypeScript support
- Lightweight

**Cons**:
- Many functions
- Some overlap with Zod

---

## Testing

### vitest
**Description**: A blazing fast unit test framework powered by Vite
**Weekly Downloads**: 1M+
**GitHub Stars**: 8k+
**Features**:
- Fast test runner
- TypeScript support
- Jest-compatible API
- Built-in mocking
- Coverage reporting

**Use Cases**:
- Unit testing
- Integration testing
- Component testing
- API testing

**Example**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletComponent } from './WalletComponent';

describe('WalletComponent', () => {
  it('renders wallet balance', () => {
    render(<WalletComponent balance={1000} />);
    expect(screen.getByText('1000 NPT')).toBeInTheDocument();
  });
});
```

**Pros**:
- Very fast
- Jest-compatible
- TypeScript first
- Modern tooling

**Cons**:
- Newer than Jest
- Smaller ecosystem

### @testing-library/react
**Description**: Simple and complete testing utilities for React components
**Weekly Downloads**: 10M+
**GitHub Stars**: 18k+
**Features**:
- Component testing utilities
- User-centric testing
- Accessibility testing
- Custom renderers

**Use Cases**:
- React component testing
- User interaction testing
- Accessibility testing

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('button click triggers action', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**Pros**:
- User-centric approach
- Excellent documentation
- Accessibility focused
- Industry standard

**Cons**:
- Learning curve
- Opinionated approach

---

## Migration from Current Implementation

To migrate from our current custom utilities:

### 1. **Replace Custom Settings Management**

**Current**: Custom `SettingsService` with manual database operations
**Target**: `electron-store` with automatic persistence

```typescript
// Before: Custom SettingsService
const settingsService = new SettingsService(db);
await settingsService.setSetting('general.theme', 'neptune');
const theme = await settingsService.getSetting('general.theme');

// After: electron-store
import Store from 'electron-store';

const store = new Store({
  schema: {
    general: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark', 'neptune'] },
        language: { type: 'string' },
        autoUpdate: { type: 'boolean' },
      },
    },
  },
});

store.set('general.theme', 'neptune');
const theme = store.get('general.theme');
```

### 2. **Replace Custom Logging**

**Current**: Custom `Logger` utility
**Target**: `pino` for high-performance structured logging

```typescript
// Before: Custom logging utility
import { Logger } from '@/utils/logging/logger';
const logger = new Logger({ scope: 'wallet' });
logger.info('Operation completed');
logger.error('Operation failed', { error });

// After: Pino integration
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

logger.info({ component: 'wallet' }, 'Operation completed');
logger.error({ component: 'wallet', error: error.message }, 'Operation failed');
```

### 3. **Replace Custom Error Handling**

**Current**: Custom `ErrorClassifier` and `ErrorRecovery`
**Target**: `@sentry/electron` for production error tracking

```typescript
// Before: Custom error handling
const { handleError, reportError } = useErrorHandler('wallet');
await handleError(error, { context: 'balance-fetch' });

// After: Sentry integration
import * as Sentry from '@sentry/electron/renderer';

try {
  await walletOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'wallet' },
    contexts: { wallet: { balance: 1000 } },
  });
}
```

### 4. **Replace Custom Caching**

**Current**: Custom LevelDB implementation
**Target**: `node-cache` for simple in-memory caching

```typescript
// Before: Custom LevelDB caching
const cache = new LevelDBHandler();
await cache.set('user:123', { name: 'John' }, 300);
const user = await cache.get('user:123');

// After: node-cache
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });
cache.set('user:123', { name: 'John' });
const user = cache.get('user:123');
```

### 5. **Replace Custom Resilience Utilities**
```typescript
// Before (custom resilience utilities - 219 lines of code)
import { retryAsync, withTimeout, CircuitBreaker } from '@/utils/resilience';

const result = await retryAsync(() => fetchData(), { retries: 3 });
const data = await withTimeout(fetchData(), { timeoutMs: 5000 });
const breaker = new CircuitBreaker({ failureThreshold: 5 });

// After (p-* packages - 0 lines of custom code)
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import pLimit from 'p-limit';

const result = await pRetry(() => fetchData(), { retries: 3 });
const data = await pTimeout(fetchData(), 5000);
const limit = pLimit(5); // Simple concurrency control
```

### 2. **Update Process Spawning**
```typescript
// Before (custom spawner with manual resilience)
import { spawn } from 'child_process';
import { retryAsync, withTimeout } from '@/utils/resilience';

const process = await retryAsync(
  () => withTimeout(spawnProcess(), { timeoutMs: 30000 }),
  { retries: 3 }
);

// After (execa + p-* packages)
import { execa } from 'execa';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';

const process = await pRetry(
  () => pTimeout(execa(command, args), 30000, 'Process timeout'),
  { retries: 3, factor: 2 }
);
```

### 3. **Benefits of Migration**
- **Remove 219+ lines** of custom resilience code
- **Battle-tested libraries** used by thousands of projects
- **Better error handling** and edge case coverage
- **Zero maintenance** - no custom code to maintain
- **Better performance** - optimized implementations
- **Active maintenance** - regular updates and bug fixes
- **TypeScript support** - excellent type definitions
- **Composable** - packages work well together

### 6. **Installation**
```bash
# Install new packages
npm install pino pino-pretty p-retry p-timeout p-limit p-queue

# Remove custom utilities
npm uninstall # Remove any custom logging and resilience utilities
```

This migration will provide a more robust, maintainable, and feature-rich process management system while significantly reducing our codebase complexity.

---

## IPC Channel Optimization Patterns

### **Consolidated Process Management** ⭐ (Recommended)

**Pattern**: Replace multiple IPC channels with a single operation-based channel.

**Implementation**:
```typescript
// Single channel for all process operations
export const PROCESS_MANAGEMENT = "process:management";

// Operation-based interface
interface ProcessOperation {
  type: 'initialize' | 'spawn' | 'stop' | 'status' | 'cleanup';
  processType?: 'neptune-core' | 'neptune-cli' | 'all';
  config?: SimpleSpawnConfig;
}

// Consolidated handler
ipcMain.handle(PROCESS_MANAGEMENT, async (event, operation: ProcessOperation) => {
  switch (operation.type) {
    case 'initialize':
      return await simpleSpawner.initialize();
    case 'spawn':
      return await simpleSpawner.spawn(operation.config!);
    case 'stop':
      return await simpleSpawner.stop(operation.processType!);
    case 'status':
      return await simpleSpawner.getStatus(operation.processType!);
    case 'cleanup':
      return await simpleSpawner.cleanup();
  }
});
```

**Benefits**:
- **85% fewer channels** (13 → 2)
- **Simplified error handling** - centralized logic
- **Easier maintenance** - single handler to update
- **Better type safety** - operation-based interface

---

### **Service-Based IPC Architecture** ⭐ (Recommended)

**Pattern**: Group related functionality into service classes with minimal IPC exposure.

**Implementation**:
```typescript
// Service class in main process
export class ProcessManagementService {
  private spawner = new SimpleNeptuneSpawner();
  private queue = new PQueue({ concurrency: 2 });

  async initialize() {
    return this.spawner.initialize();
  }

  async spawnProcess(config: SimpleSpawnConfig) {
    return this.queue.add(() => this.spawner.spawn(config));
  }

  async stopProcess(processType: string) {
    return this.spawner.stop(processType);
  }

  async getProcessStatus(processType: string) {
    return this.spawner.getStatus(processType);
  }
}

// Single IPC handler
const processService = new ProcessManagementService();
ipcMain.handle('process:management', async (event, operation) => {
  return processService[operation.method](...operation.args);
});
```

**Benefits**:
- **Encapsulated logic** - business logic in service classes
- **Minimal IPC surface** - only expose necessary methods
- **Better testing** - test services independently
- **Cleaner separation** - main process logic vs IPC layer

---

### **Batch Operations Pattern** ⭐ (Recommended)

**Pattern**: Combine multiple related operations into single IPC calls.

**Implementation**:
```typescript
// Batch multiple operations
interface BatchOperation {
  operations: Array<{
    type: 'spawn' | 'stop' | 'status';
    processType: string;
    config?: SimpleSpawnConfig;
  }>;
}

// Single batch handler
ipcMain.handle('process:batch', async (event, batch: BatchOperation) => {
  const results = await Promise.allSettled(
    batch.operations.map(op => processService.executeOperation(op))
  );

  return {
    success: results.every(r => r.status === 'fulfilled'),
    results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
  };
});

// Usage in renderer
const result = await window.api.processBatch({
  operations: [
    { type: 'spawn', processType: 'neptune-core', config: coreConfig },
    { type: 'spawn', processType: 'neptune-cli', config: cliConfig }
  ]
});
```

**Benefits**:
- **Reduced IPC overhead** - fewer round trips
- **Atomic operations** - all or nothing execution
- **Better performance** - parallel execution
- **Simplified error handling** - batch-level error management

---

### **Event-Driven Status Updates** ⭐ (Recommended)

**Pattern**: Use IPC events for real-time updates instead of polling.

**Implementation**:
```typescript
// Event-based status updates
export const PROCESS_EVENTS = {
  PROCESS_STARTED: 'process:started',
  PROCESS_STOPPED: 'process:stopped',
  PROCESS_ERROR: 'process:error',
  STATUS_UPDATED: 'process:status:updated'
};

// Emit events from service
class ProcessManagementService {
  async spawnProcess(config: SimpleSpawnConfig) {
    try {
      const process = await this.spawner.spawn(config);

      // Emit event to renderer
      mainWindow.webContents.send(PROCESS_EVENTS.PROCESS_STARTED, {
        processType: config.processType,
        pid: process.pid,
        timestamp: Date.now()
      });

      return process;
    } catch (error) {
      mainWindow.webContents.send(PROCESS_EVENTS.PROCESS_ERROR, {
        processType: config.processType,
        error: error.message
      });
      throw error;
    }
  }
}

// Listen in renderer
useEffect(() => {
  const handleProcessStarted = (event, data) => {
    setProcessStatus(prev => ({ ...prev, [data.processType]: 'running' }));
  };

  window.api.on(PROCESS_EVENTS.PROCESS_STARTED, handleProcessStarted);
  return () => window.api.off(PROCESS_EVENTS.PROCESS_STARTED, handleProcessStarted);
}, []);
```

**Benefits**:
- **Real-time updates** - no polling required
- **Better performance** - only update when needed
- **Cleaner code** - event-driven architecture
- **Reduced IPC calls** - push instead of pull

---

### **Type-Safe IPC Interface** ⭐ (Recommended)

**Pattern**: Generate type-safe IPC interfaces from service definitions.

**Implementation**:
```typescript
// Service interface definition
interface ProcessServiceInterface {
  initialize(): Promise<boolean>;
  spawn(config: SimpleSpawnConfig): Promise<SpawnedProcess>;
  stop(processType: string): Promise<boolean>;
  getStatus(processType: string): Promise<ProcessStatus>;
  cleanup(): Promise<void>;
}

// Generated IPC types
type ProcessIpcMethods = {
  [K in keyof ProcessServiceInterface]: ProcessServiceInterface[K];
};

// Type-safe renderer API
export const processApi: ProcessIpcMethods = {
  initialize: () => window.api.processManagement({ method: 'initialize', args: [] }),
  spawn: (config) => window.api.processManagement({ method: 'spawn', args: [config] }),
  stop: (processType) => window.api.processManagement({ method: 'stop', args: [processType] }),
  getStatus: (processType) => window.api.processManagement({ method: 'getStatus', args: [processType] }),
  cleanup: () => window.api.processManagement({ method: 'cleanup', args: [] })
};
```

**Benefits**:
- **Compile-time safety** - catch errors before runtime
- **Auto-completion** - IDE support for all methods
- **Refactoring safety** - changes propagate automatically
- **Documentation** - interface serves as documentation

---

### **Resilient Process Management** ⭐ (Recommended)

**Pattern**: Use battle-tested packages for process management with built-in resilience.

**Implementation**:
```typescript
import { execa } from 'execa';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import pLimit from 'p-limit';
import PQueue from 'p-queue';

export class ResilientProcessManager {
  private queue = new PQueue({ concurrency: 2 });
  private limit = pLimit(3);

  async spawnProcess(name: string, command: string, args: string[]) {
    return this.queue.add(() =>
      this.limit(() =>
        pRetry(
          () => pTimeout(
            execa(command, args, {
              stdio: ['ignore', 'pipe', 'pipe'],
              detached: false
            }),
            30000,
            'Process spawn timeout'
          ),
          {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
            onFailedAttempt: (error) => {
              console.log(`Spawn attempt ${error.attemptNumber} failed: ${error.message}`);
            }
          }
        )
      )
    );
  }

  async getProcessStats(pid: number) {
    return pTimeout(
      pidusage(pid),
      5000,
      'Process stats timeout'
    );
  }
}
```

**Benefits**:
- **Battle-tested reliability** - used by thousands of projects
- **Built-in resilience** - retry, timeout, concurrency control
- **Zero custom code** - no maintenance overhead
- **Better error handling** - comprehensive edge case coverage

---

### **Configuration-Driven IPC** ⭐ (Recommended)

**Pattern**: Define IPC channels and handlers through configuration.

**Implementation**:
```typescript
// IPC configuration
const IPC_CONFIG = {
  channels: {
    'process:management': {
      handler: 'ProcessManagementService',
      methods: ['initialize', 'spawn', 'stop', 'getStatus', 'cleanup']
    },
    'settings:management': {
      handler: 'SettingsService',
      methods: ['get', 'set', 'getAll', 'reset']
    }
  }
};

// Auto-register handlers
function registerIpcHandlers(config: typeof IPC_CONFIG) {
  Object.entries(config.channels).forEach(([channel, { handler, methods }]) => {
    const service = new (getService(handler))();

    ipcMain.handle(channel, async (event, { method, args }) => {
      if (methods.includes(method)) {
        return service[method](...args);
      }
      throw new Error(`Method ${method} not allowed on ${channel}`);
    });
  });
}
```

**Benefits**:
- **Declarative configuration** - easy to understand and modify
- **Auto-registration** - no manual handler setup
- **Method validation** - only allowed methods can be called
- **Centralized management** - all IPC definitions in one place

---

### **Performance Optimization Patterns**

#### **Connection Pooling**
```typescript
// Reuse IPC connections
class IpcConnectionPool {
  private connections = new Map<string, any>();

  getConnection(service: string) {
    if (!this.connections.has(service)) {
      this.connections.set(service, new ServiceConnection(service));
    }
    return this.connections.get(service);
  }
}
```

#### **Request Batching**
```typescript
// Batch multiple requests
class BatchedIpcClient {
  private batchQueue: Array<{ id: string; request: any }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  async request(method: string, args: any[]) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      this.batchQueue.push({ id, request: { method, args, resolve, reject } });

      if (this.batchTimeout) clearTimeout(this.batchTimeout);
      this.batchTimeout = setTimeout(() => this.flushBatch(), 10);
    });
  }
}
```

#### **Caching Layer**
```typescript
// Cache IPC responses
class CachedIpcClient {
  private cache = new Map<string, { value: any; expiry: number }>();

  async request(method: string, args: any[], ttl = 5000) {
    const key = `${method}:${JSON.stringify(args)}`;
    const cached = this.cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const result = await this.rawRequest(method, args);
    this.cache.set(key, { value: result, expiry: Date.now() + ttl });
    return result;
  }
}
```

These patterns provide a comprehensive approach to simplifying IPC architecture while maintaining functionality and improving performance.
