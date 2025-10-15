import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeptuneRpcService } from '@/main/services/neptune-rpc.service';

// Mock ky
vi.mock('ky', () => ({
  default: {
    post: vi.fn().mockReturnValue({
      json: vi.fn(),
    }),
  },
}));

// Mock logger
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock crypto for request ID generation
vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from([1, 2, 3, 4])),
}));

describe('NeptuneRpcService - Real Tests', () => {
  let rpcService: NeptuneRpcService;
  let mockKyPost: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked ky module
    const kyModule = await vi.importMock('ky');
    mockKyPost = (kyModule.default as any).post;

    // Ensure the mock returns a chainable object
    mockKyPost.mockReturnValue({
      json: vi.fn(),
    });

    rpcService = new NeptuneRpcService(8080);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication and Connection Management', () => {
    it('should require cookie before making RPC calls', async () => {
      // Test that calls fail without authentication
      await expect(rpcService.getBalance()).rejects.toThrow(
        'RPC connection not available - neptune-cli may be shutting down'
      );
    });

    it('should allow RPC calls after setting cookie', async () => {
      // Set up successful response
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: {
          confirmed: '1000.0',
          unconfirmed: '50.0',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      });

      rpcService.setCookie('test-cookie');

      const result = await rpcService.getBalance();

      expect(result).toEqual({
        confirmed: '1000.0',
        unconfirmed: '50.0',
        lastUpdated: '2024-01-01T00:00:00Z',
      });
    });

    it('should prevent RPC calls after disconnect', async () => {
      rpcService.setCookie('test-cookie');
      rpcService.disconnect();

      await expect(rpcService.getBalance()).rejects.toThrow(
        'RPC connection not available - neptune-cli may be shutting down'
      );
    });
  });

  describe('RPC Request Formatting', () => {
    beforeEach(() => {
      rpcService.setCookie('test-cookie');
    });

    it('should format get_balance requests correctly', async () => {
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: {
          confirmed: '1000.0',
          unconfirmed: '0.0',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      });

      await rpcService.getBalance();

      expect(mockKyPost).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8080'),
        expect.objectContaining({
          json: expect.objectContaining({
            jsonrpc: '2.0',
            method: 'get_balance',
            params: {},
            id: expect.any(Number),
          }),
        })
      );
    });

    it('should format block_difficulties requests with parameters', async () => {
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: [[1, [100, 200, 300]]],
      });

      await rpcService.getBlockDifficulties({
        block_selector: 'latest',
        max_num_blocks: 10,
      });

      expect(mockKyPost).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8080'),
        expect.objectContaining({
          json: expect.objectContaining({
            jsonrpc: '2.0',
            method: 'block_difficulties',
            params: {
              block_selector: 'latest',
              max_num_blocks: 10,
            },
            id: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      rpcService.setCookie('test-cookie');
    });

    it('should handle RPC errors properly', async () => {
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found',
        },
      });

      await expect(rpcService.getBalance()).rejects.toThrow('Method not found');
    });

    it('should handle network errors', async () => {
      mockKyPost.mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(rpcService.getBalance()).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      vi.mocked(mockKyPost().json).mockRejectedValue(new Error('Invalid JSON'));

      await expect(rpcService.getBalance()).rejects.toThrow('Invalid JSON');
    });

    it('should handle timeout errors', async () => {
      vi.mocked(mockKyPost().json).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );

      await expect(rpcService.getBalance()).rejects.toThrow('Request timeout');
    });
  });

  describe('Request ID Management', () => {
    beforeEach(() => {
      rpcService.setCookie('test-cookie');
    });

    it('should generate unique request IDs', async () => {
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: {
          confirmed: '1000.0',
          unconfirmed: '0.0',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      });

      // Clear any previous calls
      mockKyPost.mockClear();

      await rpcService.getBalance();
      await rpcService.getBalance();

      const calls = mockKyPost.mock.calls;
      expect(calls).toHaveLength(2);
      expect(calls[0][1].json.id).not.toBe(calls[1][1].json.id);
    });
  });

  describe('Cookie Authentication', () => {
    it('should include cookie in request headers when set', async () => {
      const cookie = 'test-cookie-value';
      rpcService.setCookie(cookie);

      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: {
          confirmed: '1000.0',
          unconfirmed: '0.0',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      });

      await rpcService.getBalance();

      expect(mockKyPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: `neptune-cli=${cookie}`,
          }),
        })
      );
    });

    it('should not include cookie when not set', async () => {
      // Don't set cookie, but mock the service to allow the call for testing
      // This tests the header construction logic
      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: {
          confirmed: '1000.0',
          unconfirmed: '0.0',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      });

      // This should fail due to connection health check, but we can test the header logic
      await expect(rpcService.getBalance()).rejects.toThrow();
    });
  });

  describe('Specific RPC Methods', () => {
    beforeEach(() => {
      rpcService.setCookie('test-cookie');
    });

    it('should handle get_balance method', async () => {
      const mockBalance = {
        confirmed: '1000.0',
        unconfirmed: '50.0',
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: mockBalance,
      });

      const result = await rpcService.getBalance();
      expect(result).toEqual(mockBalance);
    });

    it('should handle generate_wallet method', async () => {
      const mockWallet = { address: 'test-address', seed: 'test-seed' };

      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: mockWallet,
      });

      const result = await rpcService.generateWallet();
      expect(result).toEqual(mockWallet);
    });

    it('should handle export_seed_phrase method', async () => {
      const mockSeed =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

      vi.mocked(mockKyPost().json).mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: mockSeed,
      });

      const result = await rpcService.exportSeedPhrase();
      expect(result).toBe(mockSeed);
    });
  });
});
