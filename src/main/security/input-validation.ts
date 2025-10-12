/**
 * Input Validation Middleware for IPC Handlers
 *
 * Provides security validation for IPC handler inputs to prevent
 * injection attacks and ensure data integrity.
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // String validation with length limits
  string: (maxLength = 1000) => z.string().max(maxLength).min(1),

  // Numeric validation
  number: z.number().finite(),
  positiveNumber: z.number().positive().finite(),
  portNumber: z.number().int().min(1).max(65535),

  // Boolean validation
  boolean: z.boolean(),

  // Array validation
  stringArray: (maxLength = 100) => z.array(z.string().max(100)).max(maxLength),

  // File path validation (basic)
  filePath: z
    .string()
    .regex(/^[a-zA-Z0-9._/-]+$/, 'Invalid file path characters'),

  // Network address validation
  ipAddress: z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  hostname: z.string().regex(/^[a-zA-Z0-9.-]+$/, 'Invalid hostname'),

  // Wallet-specific validations
  walletName: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid wallet name')
    .max(50),
  seedPhrase: z.string().min(12).max(200),

  // Process management validations
  processId: z.number().int().positive(),

  // Settings validation
  settingKey: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid setting key')
    .max(100),
  settingValue: z.union([z.string().max(1000), z.number(), z.boolean()]),

  // Cookie validation - allows hex strings and empty strings
  cookie: z
    .string()
    .max(200)
    .regex(/^[a-fA-F0-9]*$/, 'Cookie must be a valid hex string'),
};

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      field?: string;
    };

/**
 * Validate input data against a schema
 */
export function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      const message = context
        ? `${context}: ${firstError.message}`
        : firstError.message;

      return {
        success: false,
        error: message,
        field: firstError.path.join('.'),
      };
    }
    return {
      success: false,
      error: context ? `${context}: Invalid input data` : 'Invalid input data',
    };
  }
}

/**
 * Create a validated IPC handler wrapper
 */
export function createValidatedHandler<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (data: TInput) => Promise<TOutput> | TOutput,
  context?: string
) {
  return async (data: unknown): Promise<TOutput> => {
    const validation = validateInput(data, schema, context);

    if (!validation.success) {
      throw new ValidationError(validation.error, validation.field);
    }

    return await handler(validation.data);
  };
}

/**
 * Sanitize string input to prevent injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize file path
 */
export function validateFilePath(path: string): string {
  // Remove any path traversal attempts
  const sanitized = path.replace(/\.\./g, '').replace(/\/+/g, '/');

  // Validate against schema
  const validation = validateInput(
    sanitized,
    ValidationSchemas.filePath,
    'File path'
  );
  if (!validation.success) {
    throw new ValidationError(validation.error);
  }

  return sanitized;
}

/**
 * Validate network address
 */
export function validateNetworkAddress(address: string): string {
  const validation = validateInput(
    address,
    ValidationSchemas.hostname,
    'Network address'
  );
  if (!validation.success) {
    throw new ValidationError(validation.error);
  }

  return address;
}

/**
 * Validate wallet name
 */
export function validateWalletName(name: string): string {
  const validation = validateInput(
    name,
    ValidationSchemas.walletName,
    'Wallet name'
  );
  if (!validation.success) {
    throw new ValidationError(validation.error);
  }

  return name;
}

/**
 * Validate process ID
 */
export function validateProcessId(pid: number): number {
  const validation = validateInput(
    pid,
    ValidationSchemas.processId,
    'Process ID'
  );
  if (!validation.success) {
    throw new ValidationError(validation.error);
  }

  return pid;
}
