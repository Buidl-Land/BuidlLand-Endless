import { useCallback } from "react";
import { Abi, AbiFunction, Address } from "abitype";
import { usePublicClient } from "wagmi";
import { useDiamondWithFacets, getFunctionAbiByName } from "./useDiamondContract";

// Create a simple result cache
const resultCache: Record<string, { data: any; timestamp: number }> = {};
// Cache expiration time (milliseconds)
const CACHE_EXPIRY = 30000; // 30 seconds

/**
 * Hook for reading Diamond contract data
 */
export const useContractRead = () => {
  const publicClient = usePublicClient();
  const { combinedAbi, diamondAddress, isLoading } = useDiamondWithFacets();

  /**
   * Generate cache key
   */
  const getCacheKey = (methodName: string, args: any[] = []) => {
    return `${methodName}:${JSON.stringify(args)}`;
  };

  /**
   * Read contract method
   * @param methodName Method name
   * @param args Method arguments
   * @param options Optional configuration
   */
  const readMethod = useCallback(
    async (
      methodName: string, 
      args: any[] = [], 
      options?: { 
        skipCache?: boolean;
      }
    ) => {
      const { skipCache = false } = options || {};
      
      if (!combinedAbi || !diamondAddress || !publicClient) {
        console.error("Contract data or public client not available");
        return null;
      }

      const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
      if (!abiFunction) {
        console.error(`Method ${methodName} not found in ABI`);
        return null;
      }

      // Check cache
      const cacheKey = getCacheKey(methodName, args);
      const cachedResult = resultCache[cacheKey];
      
      if (!skipCache && cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
        return cachedResult.data;
      }

      try {
        const result = await publicClient.readContract({
          address: diamondAddress,
          abi: combinedAbi,
          functionName: methodName,
          args,
        });

        // Update cache
        resultCache[cacheKey] = {
          data: result,
          timestamp: Date.now(),
        };
        
        return result;
      } catch (error) {
        console.error(`Error reading contract method ${methodName}:`, error);
        return null;
      }
    },
    [combinedAbi, diamondAddress, publicClient]
  );

  /**
   * Batch read contract methods
   * @param calls Method call array, each element containing method name and parameters
   * @param options Optional configuration
   */
  const batchRead = useCallback(
    async (
      calls: { method: string; args?: any[] }[],
      options?: { 
        skipCache?: boolean;
      }
    ) => {
      if (!combinedAbi || !diamondAddress || !publicClient) {
        console.error("Contract data or public client not available");
        return [];
      }

      try {
        const results = await Promise.all(
          calls.map(({ method, args = [] }) => readMethod(method, args, options))
        );

        return results;
      } catch (error) {
        console.error("Error in batch read:", error);
        return [];
      }
    },
    [combinedAbi, diamondAddress, publicClient, readMethod]
  );

  /**
   * Clear specific method cache
   * @param methodName Method name
   * @param args Method parameters
   */
  const clearCache = useCallback((methodName?: string, args?: any[]) => {
    if (methodName) {
      const cacheKey = getCacheKey(methodName, args);
      delete resultCache[cacheKey];
    } else {
      // Clear all cache
      Object.keys(resultCache).forEach(key => {
        delete resultCache[key];
      });
    }
  }, []);

  return {
    readMethod,
    batchRead,
    clearCache,
    isLoading,
    diamondAddress,
    combinedAbi,
  };
}; 