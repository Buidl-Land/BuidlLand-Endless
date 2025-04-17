import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Abi, AbiFunction } from "abitype";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import externalContracts from "~~/contracts/externalContracts";

/**
 * Get ABI for all Facets
 */
export const useFacetsAbi = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data: diamondData, isLoading: diamondLoading } = useDeployedContractInfo({
    contractName: "Diamond" as ContractName
  });

  // Load all facet ABIs upfront to avoid conditional hook calls
  const { data: accessControlFacetData } = useDeployedContractInfo({
    contractName: "AccessControlFacet" as ContractName
  });

  const { data: projectFacetData } = useDeployedContractInfo({
    contractName: "ProjectFacet" as ContractName
  });

  const { data: crowdfundingFacetData } = useDeployedContractInfo({
    contractName: "CrowdfundingFacet" as ContractName
  });

  const { data: taskMarketFacetData } = useDeployedContractInfo({
    contractName: "TaskMarketFacet" as ContractName
  });

  const { data: projectTokenFacetData } = useDeployedContractInfo({
    contractName: "ProjectTokenFacet" as ContractName
  });

  // Get external contract data
  const chainId = targetNetwork.id;
  const mockUsdcData = externalContracts[chainId as keyof typeof externalContracts]?.["MockUSDC"];

  // Ensure Diamond contract ABI is always available
  if (!diamondData?.abi && !diamondLoading) {
    console.error("Diamond contract ABI not found");
  }

  // Use Diamond contract ABI as base, to ensure basic functionality even if other Facet ABIs fail to load
  const combinedAbi: Abi = [...(diamondData?.abi || [])] as Abi;

  // If MockUSDC contract exists, add its ABI
  if (mockUsdcData?.abi) {
    // Use spread with array concat instead of push to maintain immutability
    const mockUsdcAbi = mockUsdcData.abi as Abi;
    const newAbi = [...combinedAbi, ...mockUsdcAbi];
    Object.assign(combinedAbi, newAbi);
  }

  // If Diamond contract ABI is empty, provide a basic ABI to avoid "ABI is required" errors
  if (combinedAbi.length === 0 && !diamondLoading) {
    console.warn("Using fallback ABI as Diamond ABI is empty");

    // Create fallback ABI
    const fallbackAbi: Abi = [
      {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
      },
      {
        type: "function",
        name: "facetAddresses",
        inputs: [],
        outputs: [{ name: "facetAddresses_", type: "address[]", internalType: "address[]" }],
        stateMutability: "view"
      }
    ];

    // Add Diamond standard ABI
    const diamondStandardAbi = getDiamondStandardAbi();

    // Combine all ABIs
    Object.assign(combinedAbi, [...fallbackAbi, ...diamondStandardAbi]);
  }

  // Add facet ABIs if available
  if (accessControlFacetData?.abi) {
    const newAbi = [...combinedAbi, ...(accessControlFacetData.abi as Abi)];
    Object.assign(combinedAbi, newAbi);
  }

  if (projectFacetData?.abi) {
    const newAbi = [...combinedAbi, ...(projectFacetData.abi as Abi)];
    Object.assign(combinedAbi, newAbi);
  }

  if (crowdfundingFacetData?.abi) {
    const newAbi = [...combinedAbi, ...(crowdfundingFacetData.abi as Abi)];
    Object.assign(combinedAbi, newAbi);
  }

  if (taskMarketFacetData?.abi) {
    const newAbi = [...combinedAbi, ...(taskMarketFacetData.abi as Abi)];
    Object.assign(combinedAbi, newAbi);
  }

  if (projectTokenFacetData?.abi) {
    const newAbi = [...combinedAbi, ...(projectTokenFacetData.abi as Abi)];
    Object.assign(combinedAbi, newAbi);
  }

  // Deduplicate to avoid duplicate function definitions
  const uniqueAbi = combinedAbi.filter((item, index, self) => {
    if (!item || !item.type) return false;

    if (item.type !== 'function') return true;

    return index === self.findIndex(t =>
      t && t.type === 'function' &&
      t.name === item.name &&
      JSON.stringify(t.inputs) === JSON.stringify(item.inputs)
    );
  }) as Abi;

  return {
    combinedAbi: uniqueAbi,
    facets: {
      diamond: diamondData,
      mockUsdc: mockUsdcData
    },
    isLoading: diamondLoading
  };
};

/**
 * Get Diamond standard ABI
 */
function getDiamondStandardAbi(): Abi {
  // Add basic methods from Diamond standard
  return [
    // Diamond Loupe methods
    {
      type: "function",
      name: "facets",
      inputs: [],
      outputs: [
        {
          name: "facets_",
          type: "tuple[]",
          components: [
            { name: "facetAddress", type: "address" },
            { name: "functionSelectors", type: "bytes4[]" }
          ]
        }
      ],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetFunctionSelectors",
      inputs: [{ name: "_facet", type: "address" }],
      outputs: [{ name: "_facetFunctionSelectors", type: "bytes4[]" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetAddresses",
      inputs: [],
      outputs: [{ name: "facetAddresses_", type: "address[]" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "facetAddress",
      inputs: [{ name: "_functionSelector", type: "bytes4" }],
      outputs: [{ name: "facetAddress_", type: "address" }],
      stateMutability: "view"
    },

    // Ownership methods
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [{ name: "_newOwner", type: "address" }],
      outputs: [],
      stateMutability: "nonpayable"
    },

    // AccessControl methods
    {
      type: "function",
      name: "hasRole",
      inputs: [
        { name: "role", type: "bytes32" },
        { name: "account", type: "address" }
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view"
    },
    {
      type: "function",
      name: "getRoleAdmin",
      inputs: [{ name: "role", type: "bytes32" }],
      outputs: [{ name: "", type: "bytes32" }],
      stateMutability: "view"
    }
  ];
}

/**
 * Add basic ABI for Diamond standard - deprecated, use getDiamondStandardAbi instead
 */
function addDiamondStandardAbi(abiArray: any[]) {
  const standardAbi = getDiamondStandardAbi();
  abiArray.push(...standardAbi);
}

/**
 * Get ABI for a method by name
 */
export const getFunctionAbiByName = (methodName: string, combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error(`No ABI available when looking for method: ${methodName}`);
    return null;
  }

  const abiFunction = combinedAbi.find(
    part => part && part.type === "function" && part.name === methodName
  );

  if (!abiFunction) {
    console.warn(`ABI for method ${methodName} not found`);
  }

  return abiFunction;
};

/**
 * Get all read methods
 */
export const getAllReadMethods = (combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error("No ABI available when getting read methods");
    return [];
  }

  return combinedAbi
    .filter(part =>
      part && part.type === "function" &&
      (part.stateMutability === "view" || part.stateMutability === "pure")
    )
    .map(part => {
      if ('name' in part) {
        return part.name;
      }
      return '';
    })
    .filter(Boolean);
};

/**
 * Get all write methods
 */
export const getAllWriteMethods = (combinedAbi: Abi) => {
  if (!combinedAbi || combinedAbi.length === 0) {
    console.error("No ABI available when getting write methods");
    return [];
  }

  return combinedAbi
    .filter(part =>
      part && part.type === "function" &&
      (part.stateMutability === "nonpayable" || part.stateMutability === "payable")
    )
    .map(part => {
      if ('name' in part) {
        return part.name;
      }
      return '';
    })
    .filter(Boolean);
};