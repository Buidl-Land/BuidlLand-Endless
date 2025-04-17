"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { mockFundingInfo, mockProjects, mockProjectTasks } from "./mockProjectData";
import { notification } from "~~/utils/scaffold-eth";
import { CrowdfundingFunctions, initializeEndlessSdk } from "../../../contracts/index";
import { EndlessJsSdk, UserResponseStatus } from "@endlesslab/endless-web3-sdk";

// Define project data type
type ProjectData = {
  id: number;
  creator: string;
  title: string;
  description: string;
  tags: string[];
  metadata: {
    aiEvaluation: string;
    marketScore: number;
    techFeasibility: string;
  };
  status: number;
  createdAt: number;
  updatedAt: number;
};

// Define funding info type
type FundingInfo = {
  fundingGoal: bigint;
  raisedAmount: bigint;
  startTime: number;
  endTime: number;
};

// Define task type
type TaskInfo = {
  id: number;
  title: string;
  description: string;
  reward: bigint;
  deadline: number;
  status: number;
  skills: string[];
};

// Create simple cache objects
const projectCache: Record<string, ProjectData> = {};
const fundingCache: Record<string, FundingInfo> = {};
const taskCountCache: Record<string, number> = {};


// Status mapping
const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-base-200 text-base-content" },
  1: { label: "Funding", color: "bg-primary text-primary-content" },
  2: { label: "In Progress", color: "bg-secondary text-secondary-content" },
  3: { label: "Completed", color: "bg-accent text-accent-content" },
  4: { label: "Cancelled", color: "bg-error text-error-content" },
};

// Task status mapping
const taskStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Open", color: "bg-green-100 text-green-800" },
  1: { label: "Assigned", color: "bg-blue-100 text-blue-800" },
  2: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  3: { label: "Completed", color: "bg-yellow-100 text-yellow-800" },
  4: { label: "Verified", color: "bg-purple-100 text-purple-800" },
  5: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export function ProjectDetailsClient({ projectId }: { projectId: string }) {
  const [wallet, setWallet] = useState<EndlessJsSdk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [fundingInfo, setFundingInfo] = useState<FundingInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "tasks">("details");
  const [taskCount, setTaskCount] = useState<number>(0);
  const [projectTasks, setProjectTasks] = useState<TaskInfo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blockchainFunding, setBlockchainFunding] = useState<bigint | null>(null);
  const [crowdfundingFuncs, setCrowdfundingFuncs] = useState<any>(null);

  // Calculate funding progress
  const fundingProgress = fundingInfo
    ? Number((fundingInfo.raisedAmount * BigInt(100)) / fundingInfo.fundingGoal)
    : 0;

  // Calculate days left
  const daysLeft = fundingInfo ? differenceInDays(new Date(fundingInfo.endTime * 1000), new Date()) : 0;

  // Check if funding is closed
  const isFundingClosed = fundingInfo ? fundingInfo.endTime < Math.floor(Date.now() / 1000) : false;

  // Initialize wallet and contract functions
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // Initialize SDK
        const sdk = initializeEndlessSdk();
        setWallet(sdk);
        
        // Initialize crowdfunding functions
        const funcs = CrowdfundingFunctions(sdk);
        setCrowdfundingFuncs(funcs);
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
      }
    };
    
    initializeWallet();
  }, []);

  // Load project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to get from cache first
      if (projectCache[projectId]) {
        setProject(projectCache[projectId]);
        setFundingInfo(fundingCache[projectId]);
        setTaskCount(taskCountCache[projectId] || 0);
        setIsLoading(false);
        return;
      }

      // Otherwise get from mock data
      const mockProject = mockProjects[projectId];
      const mockFunding = mockFundingInfo[projectId];
      
      if (mockProject) {
        // Store in cache for future use
        projectCache[projectId] = mockProject;
        setProject(mockProject);
        
        if (mockFunding) {
          fundingCache[projectId] = mockFunding;
          setFundingInfo(mockFunding);
        }
        
        // Get tasks for this project
        const taskKeys = Object.keys(mockProjectTasks).filter(key => key.startsWith(`${projectId}-`));
        taskCountCache[projectId] = taskKeys.length;
        setTaskCount(taskKeys.length);
      }
      
      setIsLoading(false);
    };
    
    fetchProjectData();
  }, [projectId]);
  
  // Load tasks when active tab is tasks
  useEffect(() => {
    const fetchProjectTasks = async () => {
      if (activeTab !== "tasks" || !project) return;
      
      setIsLoadingTasks(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter tasks for this project
      const taskKeys = Object.keys(mockProjectTasks).filter(key => key.startsWith(`${projectId}-`));
      const tasks = taskKeys.map(key => {
        const taskData = mockProjectTasks[key];
        return {
          id: parseInt(key.split('-')[1]),
          title: taskData.title,
          description: taskData.description,
          reward: taskData.reward,
          deadline: taskData.deadline,
          status: taskData.status,
          skills: taskData.requiredSkills,
        };
      });
      
      setProjectTasks(tasks);
      setIsLoadingTasks(false);
    };
    
    fetchProjectTasks();
  }, [activeTab, projectId, project]);
  
  // Fetch blockchain funding data for project 1 and project 2
  useEffect(() => {
    const fetchBlockchainFunding = async () => {
      if ((projectId === "1" || projectId === "2") && crowdfundingFuncs) {
        try {
          const fundingAmount = await crowdfundingFuncs.getCrowdFundingV2();
          console.log("获取众筹信息 (原始数据):", fundingAmount);
          
          // Process the returned array format
          let amount = BigInt(0);
          if (Array.isArray(fundingAmount) && fundingAmount.length > 0) {
            // Convert string to number if needed
            amount = BigInt(fundingAmount[0]);
          } else if (typeof fundingAmount === 'number' || typeof fundingAmount === 'bigint') {
            amount = BigInt(fundingAmount);
          }
          
          console.log("处理后的众筹金额:", amount.toString());
          setBlockchainFunding(amount);
        } catch (error) {
          console.error("Error fetching blockchain funding:", error);
        }
      }
    };
    
    fetchBlockchainFunding();
  }, [projectId, crowdfundingFuncs, isRefreshing]);
  
  // Handle blockchain funding
  const handleFundProject = async () => {
    if (!wallet || !crowdfundingFuncs) {
      notification.error("Please connect your wallet first");
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      // Connect wallet if not already connected
      const connectResult = await wallet.connect();
      
      if (connectResult.status === UserResponseStatus.APPROVED) {
        // For project 1 and project 2, use deposit funding method
        if (projectId === "1" || projectId === "2") {
          // 使用的资金金额需要考虑精度 - 1000 表示 10 USDC (实际链上值是 1000 * 1e8)
          const amount = 5000;
          console.log(`准备为项目 ${projectId} 捐助金额:`, amount, "(约等于10 USDC)");
          
          // 先显示处理中的通知
          notification.loading("Transaction is being processed...");
          
          try {
            const result = await crowdfundingFuncs.depositFunding(amount);
            
            if (result) {
              // 清除所有通知并显示成功
              notification.success(`Funding successful! Transaction: ${result}`);
              
              // Refresh funding data after transaction
              const updatedFunding = await crowdfundingFuncs.getCrowdFundingV2();
              console.log("交易后获取更新的众筹金额:", updatedFunding);
              
              // Process the returned array format
              let newAmount = BigInt(0);
              if (Array.isArray(updatedFunding) && updatedFunding.length > 0) {
                newAmount = BigInt(updatedFunding[0]);
              } else if (typeof updatedFunding === 'number' || typeof updatedFunding === 'bigint') {
                newAmount = BigInt(updatedFunding);
              }
              
              console.log("更新后的众筹金额:", newAmount.toString(), `(实际约等于 ${Number(newAmount) / 1e8} USDC)`);
              setBlockchainFunding(newAmount);
            }
          } catch (txError) {
            console.error("Transaction error:", txError);
            notification.error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`);
          }
        } else {
          // For other projects, use contribute funding method
          const amount = 100; // 100 units with appropriate decimals
          
          // 先显示处理中的通知
          notification.loading("Transaction is being processed...");
          
          try {
            const result = await crowdfundingFuncs.contributeFunding(amount);
            
            if (result) {
              // 清除所有通知并显示成功
              notification.success(`Funding successful! Transaction: ${result}`);
            }
          } catch (txError) {
            console.error("Transaction error:", txError);
            notification.error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`);
          }
        }
      } else {
        notification.error("Wallet connection rejected");
      }
    } catch (error) {
      console.error("Error funding project:", error);
      notification.error(`Funding failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-16 animate-fade-in min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-base-content/70">Loading project details...</p>
      </div>
    );
  }
  
  const status = statusMap[project.status] || { label: "Unknown", color: "bg-gray-100 text-gray-800" };
  
  // Modify the funding display for project 1 and project 2
  const displayFundingInfo = () => {
    if ((projectId === "1" || projectId === "2") && blockchainFunding !== null) {
      console.log("显示项目资金信息:", projectId);
      console.log("区块链原始资金:", blockchainFunding.toString());
      
      // 对金额进行显示格式化 - 除以1e8获得正确的显示值
      const formattedFunding = Number(blockchainFunding) / 1e8;
      const formattedGoal = Number(fundingInfo?.fundingGoal) / 1e8;
      
      console.log("格式化后的资金:", formattedFunding);
      console.log("格式化后的目标:", formattedGoal);
      
      // 所有项目使用相同的计算逻辑计算进度百分比
      let progressPercentage = fundingInfo ? 
        Number((blockchainFunding * BigInt(100)) / (fundingInfo?.fundingGoal || BigInt(1))) : 0;
      
      console.log("计算的进度百分比:", progressPercentage);
      
      // 使用区块链数据为项目1和项目2
      return (
        <div>
          <div className="flex justify-between mb-1">
            <span>Funding Goal</span>
            <span className="font-bold">
              {formattedGoal.toLocaleString()} USDC
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Raised Amount (Blockchain)</span>
            <span className="font-bold">
              {formattedFunding.toLocaleString()} USDC
            </span>
          </div>
          {/* 进度条 */}
          <div className="w-full mt-2 bg-base-300 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-70">
            <span>{progressPercentage}% Funded</span>
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Funding ended'}</span>
          </div>
          {/* 资金捐助按钮 */}
          <button 
            className="w-full mt-4 btn btn-primary"
            onClick={handleFundProject}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Processing...
              </>
            ) : (
              "Fund This Project"
            )}
          </button>
        </div>
      );
    } else {
      // 使用模拟数据为其他项目
      return (
        <div>
          <div className="flex justify-between mb-1">
            <span>Funding Goal</span>
            <span className="font-bold">{Number(fundingInfo?.fundingGoal) / 1e18} USDC</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Raised Amount</span>
            <span className="font-bold">{Number(fundingInfo?.raisedAmount) / 1e18} USDC</span>
          </div>
          {/* 进度条 */}
          <div className="w-full mt-2 bg-base-300 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${fundingProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-70">
            <span>{fundingProgress}% Funded</span>
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Funding ended'}</span>
          </div>
          {/* 资金捐助按钮 */}
          <button 
            className="w-full mt-4 btn btn-primary"
            onClick={handleFundProject}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Processing...
              </>
            ) : (
              "Fund This Project"
            )}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-16 animate-fade-in">
      {/* Project Header */}
      <div className="w-full bg-gradient-to-b from-base-200/50 to-transparent">
        <div className="container px-4 py-8 mx-auto max-w-6xl">
          <div className="relative mb-6">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
              
              {project.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-base-300/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-200/50 inline-flex">
            <button
              className={`tab ${activeTab === "details" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Project Details
            </button>
            <button
              className={`tab ${activeTab === "tasks" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              Tasks ({taskCount})
            </button>
          </div>
        </div>
      </div>
      
      {/* Project Content */}
      <div className="container px-4 mx-auto max-w-6xl">
        {activeTab === "details" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Project Details */}
            <div className="p-6 shadow-lg md:col-span-3 card bg-base-100">
              <h2 className="mb-4 text-2xl font-bold">Project Overview</h2>
              <p className="mb-6 whitespace-pre-line">{project.description}</p>
              
              {/* Project Metrics */}
              <h3 className="mb-3 text-xl font-bold">Project Evaluation</h3>
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-base-200/50">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-primary material-icons">analytics</span>
                    <h3 className="text-sm font-bold">Market Score</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{project.metadata.marketScore}/10</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-base-200/50">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-primary material-icons">build</span>
                    <h3 className="text-sm font-bold">Technical Feasibility</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{project.metadata.techFeasibility}</span>
                    <span className="ml-2 text-sm text-base-content/70">Grade</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-base-200/50">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-primary material-icons">schedule</span>
                    <h3 className="text-sm font-bold">Project Age</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {differenceInDays(new Date(), new Date(project.createdAt * 1000))}
                    </span>
                    <span className="ml-2 text-sm text-base-content/70">Days</span>
                  </div>
                </div>
              </div>
              
              {/* AI Evaluation */}
              <h3 className="mb-3 text-xl font-bold">AI Evaluation</h3>
              <div className="p-6 mb-6 border rounded-lg bg-base-200/30 border-base-300">
                <p className="italic">{project.metadata.aiEvaluation}</p>
              </div>
              
              {/* Funding Information */}
              <div className="mb-4">
                {fundingInfo && displayFundingInfo()}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Creator Card */}
              <div className="p-6 shadow-lg card bg-base-100">
                <h2 className="mb-4 text-xl font-bold">Creator</h2>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="w-12 h-12 rounded-full bg-neutral-focus text-neutral-content flex items-center justify-center">
                      <span>{project.creator.slice(2, 4)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{project.creator.slice(0, 6)}...{project.creator.slice(-4)}</p>
                      <div className="tooltip" data-tip="Copy address">
                        <button className="btn btn-xs btn-ghost btn-square">
                          <span className="material-icons text-xs">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-primary mt-0.5">
                      <span className="material-icons text-xs mr-1">verified</span>
                      <span>agent@BuidllandAI</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-base-300/50">
                  <div className="flex justify-between mb-1 text-xs opacity-70">
                    <span>Created</span>
                    <span>{formatDistanceToNow(new Date(project.createdAt * 1000), { addSuffix: true })}</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-70">
                    <span>Last Updated</span>
                    <span>{formatDistanceToNow(new Date(project.updatedAt * 1000), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link href="/projects" className="btn btn-outline">
                  <span className="mr-2 material-icons">arrow_back</span>
                  Back to Projects
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Tasks Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Project Tasks</h2>
              <Link href={`/projects/${projectId}/tasks/create`} className="btn btn-primary btn-sm">
                <span className="mr-2 material-icons">add</span>
                Create Task
              </Link>
            </div>
            
            {/* Tasks List */}
            {isLoadingTasks ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : projectTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectTasks.map((task) => (
                  <Link 
                    key={task.id}
                    href={`/projects/${projectId}/tasks/${task.id}`}
                    className="p-6 transition-all shadow-md hover:shadow-lg card bg-base-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold line-clamp-1">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${taskStatusMap[task.status]?.color || ""}`}>
                        {taskStatusMap[task.status]?.label || "Unknown"}
                      </span>
                    </div>
                    
                    <p className="mb-4 text-sm opacity-80 line-clamp-3">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {task.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-base-200">
                          {skill}
                        </span>
                      ))}
                      {task.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-base-200">
                          +{task.skills.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-xs opacity-70">Reward</p>
                        <p className="font-medium">{Number(task.reward) / 1e18} USDC</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-70">Deadline</p>
                        <p className="font-medium">
                          {differenceInDays(new Date(task.deadline * 1000), new Date())} days left
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center shadow-lg card bg-base-100">
                <p className="text-lg opacity-60">No tasks have been created for this project yet.</p>
                <Link href={`/projects/${projectId}/tasks/create`} className="mx-auto mt-4 btn btn-primary btn-sm">
                  Create First Task
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}