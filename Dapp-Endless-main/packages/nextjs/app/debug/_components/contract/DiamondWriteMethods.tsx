"use client";

import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { FacetCategory } from "./DiamondContractUI";
import { Contract } from "~~/utils/scaffold-eth/contract";
import { getAllWriteMethods, getFunctionAbiByName, useFacetsAbi } from "./utilsDiamond";

// Define methods included in each category
const categoryMethods: Record<Exclude<FacetCategory, "all" | "mockusdc">, string[]> = {
  accessControl: [
    "grantRole",
    "revokeRole",
    "renounceRole",
    "addAdmin",
    "removeAdmin",
    "grantProjectCreatorRole",
    "grantFundingManagerRole",
    "grantTaskCreatorRole",
    "grantAiAgentRole"
  ],
  project: [
    "createProject",
    "updateProject",
    "deleteProject",
    "addProjectMember",
    "removeProjectMember",
    "setProjectStatus",
    "updateProjectDetails",
    "archiveProject"
  ],
  crowdfunding: [
    "contribute",
    "withdrawContribution",
    "setFundingGoal",
    "setFundingDeadline",
    "releaseFunds",
    "refundContributors",
    "createCrowdfunding",
    "closeCrowdfunding"
  ],
  taskMarket: [
    "createTask",
    "updateTask",
    "deleteTask",
    "assignTask",
    "completeTask",
    "approveTask",
    "rejectTask",
    "applyForTask",
    "setTaskReward",
    "setTaskDeadline"
  ],
  projectToken: [
    "createProjectToken",
    "mintTokens",
    "burnTokens",
    "transferTokens",
    "claimTokens",
    "setTokenAllocation",
    "setVestingSchedule",
    "pauseTokenTransfers",
    "unpauseTokenTransfers"
  ]
};

type DiamondWriteMethodsProps = {
  diamondContractData: Contract<"Diamond">;
  activeCategory: FacetCategory;
  onChange?: () => void;
};

export const DiamondWriteMethods = ({ diamondContractData, activeCategory, onChange }: DiamondWriteMethodsProps) => {
  const [writeMethods, setWriteMethods] = useState<string[]>([]);
  const { combinedAbi, isLoading } = useFacetsAbi();
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  useEffect(() => {
    if (!diamondContractData) {
      setError("Diamond contract data is missing");
      return;
    }

    if (!combinedAbi || combinedAbi.length === 0) {
      if (!isLoading) {
        setError("ABI is required but not available");
      }
      return;
    } else {
      setError(null);
    }

    try {
      // Get all write methods
      const allMethods = getAllWriteMethods(combinedAbi);
      setAvailableMethods(allMethods);

      // Filter methods based on active category
      if (activeCategory === "all") {
        setWriteMethods(allMethods);
      } else if (activeCategory === "mockusdc") {
        // MockUSDC is handled directly in DiamondContractUI
        setWriteMethods([]);
      } else {
        // First try to use predefined categories
        const predefinedMethods = categoryMethods[activeCategory];

        // Filter out methods that actually exist in the ABI
        const filteredMethods = predefinedMethods.filter(method =>
          allMethods.includes(method)
        );

        // If no methods after filtering, show all write methods
        if (filteredMethods.length === 0) {
          setWriteMethods(allMethods);
        } else {
          setWriteMethods(filteredMethods);
        }
      }
    } catch (err) {
      console.error("Error processing ABI:", err);
      setError("Error processing ABI data");
    }
  }, [diamondContractData, combinedAbi, activeCategory, isLoading]);

  if (isLoading) {
    return <p className="text-gray-500">Loading contract methods...</p>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">
          Please ensure all contracts are properly deployed and configured in deployedContracts.ts
        </p>
      </div>
    );
  }

  if (!writeMethods || writeMethods.length === 0) {
    if (availableMethods.length > 0) {
      return (
        <div className="text-gray-500 italic">
          <p>No write methods available for this category.</p>
          <p className="mt-2">Available write methods: {availableMethods.join(", ")}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">No write methods available</p>;
  }

  return (
    <>
      {writeMethods.map(methodName => {
        const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
        if (!abiFunction) return null;

        return (
          <div key={methodName} className="py-3 first:pt-0 last:pb-0">
            <WriteOnlyFunctionForm
              abiFunction={abiFunction as AbiFunction}
              contractAddress={diamondContractData.address}
              abi={combinedAbi}
              onChange={onChange || (() => {})}
            />
          </div>
        );
      })}
    </>
  );
};