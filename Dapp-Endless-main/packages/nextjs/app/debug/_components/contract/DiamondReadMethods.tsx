"use client";

import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { FacetCategory } from "./DiamondContractUI";
import { Contract } from "~~/utils/scaffold-eth/contract";
import { getAllReadMethods, getFunctionAbiByName, useFacetsAbi } from "./utilsDiamond";

// Define methods included in each category
const categoryMethods: Record<Exclude<FacetCategory, "all" | "mockusdc">, string[]> = {
  accessControl: [
    "hasRole",
    "getRoleAdmin",
    "isAdmin",
    "ADMIN_ROLE",
    "PROJECT_CREATOR_ROLE",
    "FUNDING_MANAGER_ROLE",
    "TASK_CREATOR_ROLE",
    "AI_AGENT_ROLE"
  ],
  project: [
    "getProject",
    "getProjects",
    "getProjectCount",
    "getProjectsByOwner",
    "getProjectStatus",
    "getProjectDetails",
    "getProjectMembers"
  ],
  crowdfunding: [
    "getContribution",
    "getTotalContributions",
    "getContributorCount",
    "getContributors",
    "getContributionsByUser",
    "getFundingGoal",
    "getFundingDeadline",
    "isFundingSuccessful"
  ],
  taskMarket: [
    "getTask",
    "getTasks",
    "getTaskCount",
    "getTasksByProject",
    "getTasksByAssignee",
    "getTaskStatus",
    "getTaskReward",
    "getTaskDeadline",
    "getTaskApplicants"
  ],
  projectToken: [
    "getProjectToken",
    "getClaimedAmount",
    "getTokenBalance",
    "getTotalSupply",
    "getTokenAllocation",
    "getVestingSchedule",
    "getTokenSymbol",
    "getTokenName"
  ]
};

type DiamondReadMethodsProps = {
  diamondContractData: Contract<"Diamond">;
  activeCategory: FacetCategory;
};

export const DiamondReadMethods = ({ diamondContractData, activeCategory }: DiamondReadMethodsProps) => {
  const [readMethods, setReadMethods] = useState<string[]>([]);
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
      // Get all read methods
      const allMethods = getAllReadMethods(combinedAbi);
      setAvailableMethods(allMethods);

      // Filter methods based on active category
      if (activeCategory === "all") {
        setReadMethods(allMethods);
      } else if (activeCategory === "mockusdc") {
        // MockUSDC is handled directly in DiamondContractUI
        setReadMethods([]);
      } else {
        // First try to use predefined categories
        const predefinedMethods = categoryMethods[activeCategory];

        // Filter out methods that actually exist in the ABI
        const filteredMethods = predefinedMethods.filter(method =>
          allMethods.includes(method)
        );

        // If no methods after filtering, show all read methods
        if (filteredMethods.length === 0) {
          setReadMethods(allMethods);
        } else {
          setReadMethods(filteredMethods);
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

  if (!readMethods || readMethods.length === 0) {
    if (availableMethods.length > 0) {
      return (
        <div className="text-gray-500 italic">
          <p>No read methods available for this category.</p>
          <p className="mt-2">Available read methods: {availableMethods.join(", ")}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">No read methods available</p>;
  }

  return (
    <>
      {readMethods.map(methodName => {
        const abiFunction = getFunctionAbiByName(methodName, combinedAbi);
        if (!abiFunction) return null;

        return (
          <div key={methodName} className="py-3 first:pt-0 last:pb-0">
            <ReadOnlyFunctionForm
              abiFunction={abiFunction as AbiFunction}
              contractAddress={diamondContractData.address}
              abi={combinedAbi}
            />
          </div>
        );
      })}
    </>
  );
};