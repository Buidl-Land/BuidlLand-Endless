import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import externalContracts from "~~/contracts/externalContracts";
import deployedContracts from "~~/contracts/deployedContracts";

/**
 * Custom hook for Diamond contract that combines ABIs from all facets
 * @returns Combined ABI and contract info for Diamond and its facets
 */
export const useDiamondWithFacets = () => {
  // Get Diamond core contract info using scaffold-eth hook
  const { data: diamondData, isLoading: diamondLoading } = useDeployedContractInfo({ 
    contractName: "Diamond" as ContractName 
  });
  
  // Get network info
  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork.id;
  
  // Get external contract data (e.g., MockUSDC)
  const mockUsdcData = externalContracts[chainId as keyof typeof externalContracts]?.["MockUSDC"];
  
  // Get deployed contracts for the target network
  const networkDeployedContracts = deployedContracts[chainId as keyof typeof deployedContracts];
  
  // Initialize combined ABI with Diamond contract ABI
  let combinedAbi: any[] = [...(diamondData?.abi || [])];
  
  // Add MockUSDC ABI if exists
  if (mockUsdcData?.abi) {
    combinedAbi = [...combinedAbi, ...mockUsdcData.abi];
  }
  
  // Add facets ABIs if deployed contracts exist
  if (networkDeployedContracts) {
    // Add Access Control Facet ABI
    if (networkDeployedContracts.AccessControlFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.AccessControlFacet.abi];
    }
    
    // Add Project Token Facet ABI
    if (networkDeployedContracts.ProjectTokenFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.ProjectTokenFacet.abi];
    }
    
    // Add Crowdfunding Facet ABI
    if (networkDeployedContracts.CrowdfundingFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.CrowdfundingFacet.abi];
    }
    
    // Add Project Facet ABI
    if (networkDeployedContracts.ProjectFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.ProjectFacet.abi];
    }
    
    // Add Task Market Facet ABI
    if (networkDeployedContracts.TaskMarketFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.TaskMarketFacet.abi];
    }
    
    // Add Diamond Cut Facet ABI for Diamond Standard functionality
    if (networkDeployedContracts.DiamondCutFacet?.abi) {
      combinedAbi = [...combinedAbi, ...networkDeployedContracts.DiamondCutFacet.abi];
    }
  }

  // Return combined ABI and contract info
  return {
    combinedAbi,
    isLoading: diamondLoading,
    diamondAddress: diamondData?.address,
  };
};

/**
 * Get ABI function definition by method name
 */
export const getFunctionAbiByName = (methodName: string, combinedAbi: any[]) => {
  if (!combinedAbi) return null;
  
  // Find matching function ABI
  const abiFunction = combinedAbi.find(
    (func) => func.type === "function" && func.name === methodName
  );
  
  return abiFunction || null;
};

/**
 * Get all read-only methods
 */
export const getAllReadMethods = (combinedAbi: any[]) => {
  if (!combinedAbi) return [];
  
  // Filter all read-only methods
  return combinedAbi
    .filter((func) => func.type === "function" && 
      (func.stateMutability === "view" || func.stateMutability === "pure"))
    .map((func) => func.name);
};

/**
 * Get all write methods
 */
export const getAllWriteMethods = (combinedAbi: any[]) => {
  if (!combinedAbi) return [];
  
  // Filter all write methods
  return combinedAbi
    .filter((func) => func.type === "function" && 
      func.stateMutability !== "view" && 
      func.stateMutability !== "pure")
    .map((func) => func.name);
}; 