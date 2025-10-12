/**
 * Mining Endpoints Hook
 *
 * Custom hook for managing mining-related RPC endpoints
 * Provides functions to interact with advanced mining features
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useOnchainStore } from '../../store/onchain.store';

export function useMiningEndpoints() {
  const {
    setBestProposal,
    setMiningResult,
    setPowSolutionResult,
    setNewTipResult,
    network,
  } = useOnchainStore();

  // Check if we're on regtest network
  const isRegtest = network === 'regtest';

  /**
   * Get the best mining proposal
   */
  const getBestProposal = useCallback(async () => {
    try {
      const response = await window.electronAPI.blockchain.getBestProposal();

      if (response.success && response.proposal) {
        setBestProposal({
          proposal: response.proposal,
          lastUpdated: new Date().toISOString(),
        });

        toast.success('Best proposal retrieved successfully');
        return response.proposal;
      } else {
        throw new Error(response.error || 'Failed to get best proposal');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to get best proposal: ${errorMessage}`);
      throw error;
    }
  }, [setBestProposal]);

  /**
   * Mine blocks to wallet (for testing purposes)
   */
  const mineBlocksToWallet = useCallback(
    async (nBlocks: number) => {
      if (!isRegtest) {
        toast.error('Mining is only available in regtest mode');
        return;
      }

      try {
        const response = await window.electronAPI.blockchain.mineBlocksToWallet(
          {
            n_blocks: nBlocks,
          }
        );

        if (response.success && response.result) {
          setMiningResult({
            result: response.result,
            lastUpdated: new Date().toISOString(),
          });

          toast.success(`Mined ${nBlocks} blocks successfully`);
          return response.result;
        } else {
          throw new Error(response.error || 'Failed to mine blocks');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        // Check for specific regtest-only error
        if (
          errorMessage.includes('Must use mock-proof network') ||
          errorMessage.includes('regtest')
        ) {
          toast.error('Mining is only available in regtest mode for safety');
        } else {
          toast.error(`Failed to mine blocks: ${errorMessage}`);
        }
        throw error;
      }
    },
    [setMiningResult, isRegtest]
  );

  /**
   * Provide proof-of-work solution
   */
  const providePowSolution = useCallback(
    async (pow: unknown, proposalId: unknown) => {
      if (!isRegtest) {
        toast.error('PoW solution is only available in regtest mode');
        return;
      }

      try {
        const response = await window.electronAPI.blockchain.providePowSolution(
          {
            pow,
            proposal_id: proposalId,
          }
        );

        if (response.success !== undefined) {
          setPowSolutionResult({
            success: response.result || false,
            lastUpdated: new Date().toISOString(),
          });

          const message = response.result
            ? 'Proof-of-work solution accepted'
            : 'Proof-of-work solution rejected';
          toast.success(message);
          return response.result;
        } else {
          throw new Error(response.error || 'Failed to provide PoW solution');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to provide PoW solution: ${errorMessage}`);
        throw error;
      }
    },
    [setPowSolutionResult, isRegtest]
  );

  /**
   * Provide new block tip
   */
  const provideNewTip = useCallback(
    async (pow: unknown, blockProposal: unknown) => {
      if (!isRegtest) {
        toast.error('New tip is only available in regtest mode');
        return;
      }

      try {
        const response = await window.electronAPI.blockchain.provideNewTip({
          pow,
          block_proposal: blockProposal,
        });

        if (response.success !== undefined) {
          setNewTipResult({
            accepted: response.result || false,
            lastUpdated: new Date().toISOString(),
          });

          const message = response.result
            ? 'New block tip accepted'
            : 'New block tip rejected';
          toast.success(message);
          return response.result;
        } else {
          throw new Error(response.error || 'Failed to provide new tip');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to provide new tip: ${errorMessage}`);
        throw error;
      }
    },
    [setNewTipResult, isRegtest]
  );

  return {
    getBestProposal,
    mineBlocksToWallet,
    providePowSolution,
    provideNewTip,
  };
}
