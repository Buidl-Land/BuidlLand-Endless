import { useCallback } from "react";
import { Address } from "abitype";
import { useWalletClient } from "wagmi";
import { usePublicClient } from "wagmi";
import { useDiamondWithFacets, getFunctionAbiByName } from "./useDiamondContract";

/**
 * Hook for writing to Diamond contract
 */
export const useContractWrite = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { combinedAbi, diamondAddress, isLoading } = useDiamondWithFacets();

  /**
   * Write contract method
   * @param methodName Method name
   * @param args Method arguments
   * @param options Optional configuration
   */
  const writeMethod = useCallback(
    async (
      methodName: string,
      args: any[] = [],
      options?: {
        onSuccess?: (txHash: `0x${string}`) => void;
        onError?: (error: Error) => void;
        gasLimit?: bigint;
      }
    ) => {
      if (!combinedAbi || !diamondAddress || isLoading || !walletClient || !publicClient) {
        const error = new Error("Contract data or wallet not available");
        options?.onError?.(error);
        return { error };
      }

      const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
      if (!abiFunction) {
        const error = new Error(`Method ${methodName} not found in ABI`);
        options?.onError?.(error);
        return { error };
      }

      try {
        // Estimate gas cost
        let gasLimit = options?.gasLimit;
        if (!gasLimit) {
          try {
            const estimatedGas = await publicClient.estimateContractGas({
              address: diamondAddress,
              abi: combinedAbi,
              functionName: methodName,
              args,
              account: walletClient.account,
            });
            // Add 20% buffer
            gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
          } catch (error) {
            console.warn(`Gas estimation failed for ${methodName}:`, error);
            // If estimation fails, don't set gasLimit, let the wallet handle it
          }
        }

        // Execute contract write
        const hash = await walletClient.writeContract({
          address: diamondAddress,
          abi: combinedAbi,
          functionName: methodName,
          args,
          gas: gasLimit,
        });

        options?.onSuccess?.(hash);
        return { hash };
      } catch (error) {
        console.error(`Error writing contract method ${methodName}:`, error);
        options?.onError?.(error as Error);
        return { error };
      }
    },
    [combinedAbi, diamondAddress, isLoading, walletClient, publicClient]
  );

  return {
    writeMethod,
    isLoading,
    diamondAddress,
    combinedAbi,
  };
}; 