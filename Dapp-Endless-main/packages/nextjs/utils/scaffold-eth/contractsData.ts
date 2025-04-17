import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GenericContractsDeclaration, contracts } from "~~/utils/scaffold-eth/contract";
import externalContracts from "~~/contracts/externalContracts";

const DEFAULT_ALL_CONTRACTS: GenericContractsDeclaration[number] = {};

export function useAllContracts() {
  const { targetNetwork } = useTargetNetwork();
  const contractsData = contracts?.[targetNetwork.id];
  const externalContractsData = externalContracts?.[targetNetwork.id as keyof typeof externalContracts];
  
  // Merge internal contracts and external contracts
  const allContracts = contractsData ? { ...contractsData } : DEFAULT_ALL_CONTRACTS;
  
  // Add external contracts (if they exist)
  if (externalContractsData) {
    Object.entries(externalContractsData).forEach(([contractName, contractData]) => {
      allContracts[contractName] = {
        ...contractData,
        external: true // Mark as external contract
      };
    });
  }
  
  return allContracts;
}
