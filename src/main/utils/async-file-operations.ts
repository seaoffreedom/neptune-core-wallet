/**
 * Async File Operations Utilities
 *
 * Provides resilient async file operations using fs-extra and p-* packages
 * for better performance and error handling.
 */

import fs from 'fs-extra';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import path from 'node:path';
import pino from 'pino';

const logger = pino({ level: 'info' });

/**
 * Resilient file read operation with retry and timeout
 */
export async function readFileWithRetry(
  filePath: string,
  options: {
    encoding?: BufferEncoding;
    retries?: number;
    timeout?: number;
  } = {}
): Promise<string> {
  const { encoding = 'utf8', retries = 3, timeout = 5000 } = options;

  return pRetry(
    () =>
      pTimeout(
        fs.readFile(filePath, encoding),
        timeout,
        `File read timeout: ${filePath}`
      ),
    {
      retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 3000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            filePath,
            error: error.message,
          },
          'File read attempt failed'
        );
      },
    }
  );
}

/**
 * Resilient file write operation with retry and timeout
 */
export async function writeFileWithRetry(
  filePath: string,
  data: string,
  options: {
    encoding?: BufferEncoding;
    retries?: number;
    timeout?: number;
  } = {}
): Promise<void> {
  const { encoding = 'utf8', retries = 3, timeout = 5000 } = options;

  return pRetry(
    () =>
      pTimeout(
        (async () => {
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, data, encoding);
        })(),
        timeout,
        `File write timeout: ${filePath}`
      ),
    {
      retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 3000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            filePath,
            error: error.message,
          },
          'File write attempt failed'
        );
      },
    }
  );
}

/**
 * Resilient JSON file read operation
 */
export async function readJsonWithRetry<T = any>(
  filePath: string,
  options: { retries?: number; timeout?: number } = {}
): Promise<T> {
  const { retries = 3, timeout = 5000 } = options;

  return pRetry(
    () =>
      pTimeout(
        fs.readJson(filePath),
        timeout,
        `JSON read timeout: ${filePath}`
      ),
    {
      retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 3000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            filePath,
            error: error.message,
          },
          'JSON read attempt failed'
        );
      },
    }
  );
}

/**
 * Resilient JSON file write operation
 */
export async function writeJsonWithRetry(
  filePath: string,
  data: unknown,
  options: { spaces?: number; retries?: number; timeout?: number } = {}
): Promise<void> {
  const { spaces = 2, retries = 3, timeout = 5000 } = options;

  return pRetry(
    () =>
      pTimeout(
        (async () => {
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeJson(filePath, data, { spaces });
        })(),
        timeout,
        `JSON write timeout: ${filePath}`
      ),
    {
      retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 3000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            filePath,
            error: error.message,
          },
          'JSON write attempt failed'
        );
      },
    }
  );
}

/**
 * Resilient file existence check
 */
export async function fileExistsWithRetry(
  filePath: string,
  options: { retries?: number; timeout?: number } = {}
): Promise<boolean> {
  const { retries = 2, timeout = 3000 } = options;

  try {
    await pRetry(
      () =>
        pTimeout(
          fs.access(filePath),
          timeout,
          `File access timeout: ${filePath}`
        ),
      {
        retries,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2000,
        onFailedAttempt: (error) => {
          logger.warn(
            {
              attempt: error.attemptNumber,
              filePath,
              error: error.message,
            },
            'File access attempt failed'
          );
        },
      }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Resilient directory creation
 */
export async function ensureDirWithRetry(
  dirPath: string,
  options: { retries?: number; timeout?: number } = {}
): Promise<void> {
  const { retries = 3, timeout = 5000 } = options;

  return pRetry(
    () =>
      pTimeout(
        fs.ensureDir(dirPath),
        timeout,
        `Directory creation timeout: ${dirPath}`
      ),
    {
      retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 3000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            dirPath,
            error: error.message,
          },
          'Directory creation attempt failed'
        );
      },
    }
  );
}
