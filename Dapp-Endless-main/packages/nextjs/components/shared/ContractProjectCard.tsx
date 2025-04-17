"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Import the mock data
import { mockProjects, mockFundingInfo } from "~~/app/projects/[id]/mockProjectData";

type ProjectData = {
  id: number;
  creator: string;
  title: string;
  description: string;
  tags: string[];
  status: number;
  createdAt: number;
  updatedAt: number;
  metadata: {
    aiEvaluation: string;
    marketScore: number;
    techFeasibility: string;
  };
};

type FundingInfo = {
  fundingGoal: bigint;
  raisedAmount: bigint;
  startTime: number;
  endTime: number;
};

// Status mapping
const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-base-200 text-base-content" },
  1: { label: "Funding", color: "bg-primary text-primary-content" },
  2: { label: "In Progress", color: "bg-secondary text-secondary-content" },
  3: { label: "Completed", color: "bg-accent text-accent-content" },
  4: { label: "Cancelled", color: "bg-error text-error-content" },
};

export const ContractProjectCard = ({ projectId }: { projectId: number | string }) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [fundingInfo, setFundingInfo] = useState<FundingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stringProjectId = projectId.toString();

  useEffect(() => {
    // Simulate loading from contract
    const loadProjectData = async () => {
      setIsLoading(true);
      
      // Add a delay to simulate contract call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get mock data for this project
      const mockProject = mockProjects[stringProjectId];
      const mockFunding = mockFundingInfo[stringProjectId];
      
      if (mockProject) {
        setProject(mockProject);
        setFundingInfo(mockFunding);
      }
      
      setIsLoading(false);
    };
    
    loadProjectData();
  }, [stringProjectId]);

  if (isLoading || !project) {
    return (
      <div className="card w-full sm:w-96 bg-base-100 shadow-xl animate-pulse">
        <div className="h-40 bg-base-300 rounded-t-xl"></div>
        <div className="card-body">
          <div className="h-6 bg-base-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-base-300 rounded mb-2"></div>
          <div className="flex justify-between">
            <div className="h-8 bg-base-300 rounded w-1/3"></div>
            <div className="h-8 bg-base-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate funding progress
  const fundingProgress = fundingInfo
    ? Number((fundingInfo.raisedAmount * BigInt(100)) / fundingInfo.fundingGoal)
    : 0;

  return (
    <Link href={`/projects/${stringProjectId}`} className="card w-full sm:w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-all">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg font-bold">{project.title}</h2>
          <span className={`badge ${statusMap[project.status]?.color || ""}`}>
            {statusMap[project.status]?.label || "Unknown"}
          </span>
        </div>
        <p className="text-sm opacity-70 line-clamp-3 mt-2">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="badge badge-sm badge-primary badge-outline">{tag}</span>
          ))}
          {project.tags.length > 3 && <span className="badge badge-sm">+{project.tags.length - 3}</span>}
        </div>
        
        {fundingInfo && project.status === 1 && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Funding Progress</span>
              <span className="font-medium">{fundingProgress}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${fundingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="card-actions justify-between items-center mt-3">
          <div className="text-xs opacity-60">
            Created {formatDistanceToNow(new Date(project.createdAt * 1000), { addSuffix: true })}
          </div>
          <button className="btn btn-primary btn-sm">View Details</button>
        </div>
      </div>
    </Link>
  );
}; 