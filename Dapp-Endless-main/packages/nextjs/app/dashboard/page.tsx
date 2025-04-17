"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { useContractRead } from "~~/hooks/contracts/useContractRead";
import { UserTasksTable } from "~~/components/dashboard/UserTasksTable";

// Project data type
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
    minValuation: number;
    maxValuation: number;
  };
  status: number;
  createdAt: number;
  updatedAt: number;
};

// Funding information type
type FundingInfo = {
  fundingGoal: bigint;
  raisedAmount: bigint;
  startTime: number;
  endTime: number;
  hasMetFundingGoal: boolean;
  paymentToken: string;
};

// Token information type
type TokenInfo = {
  tokenAddress: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  crowdfundingPool: bigint;
  teamPool: bigint;
  ecosystemPool: bigint;
  createdAt: number;
};

// User investment information type
type UserInvestment = {
  projectId: number;
  projectTitle: string;
  contributionAmount: bigint;
  status: string;
  fundingGoal: bigint;
  raisedAmount: bigint;
  fundingProgress: number;
};

// Token release information type
type TokenReleaseInfo = {
  projectId: number;
  projectTitle: string;
  totalTokens: bigint;
  unlockedTokens: bigint;
  vestingStartDate: number;
  vestingEndDate: number;
  percentUnlocked: number;
  tokenSymbol: string;
  releaseSchedule: ReleaseScheduleItem[];
};

// Token release schedule item
type ReleaseScheduleItem = {
  date: number; // Timestamp (seconds)
  percentage: number; // Unlock percentage
  tokenAmount: bigint; // Unlocked token amount
  isUnlocked: boolean; // Whether it's unlocked
};

// Investment status distribution type
type InvestmentStatusDistribution = {
  active: number;
  funded: number;
  failed: number;
  pending: number;
};

// Tag distribution type
type TagDistribution = Record<string, number>;

// Cache object
interface Cache {
  projects: Record<number, ProjectData>;
  fundingInfo: Record<number, FundingInfo>;
  contributions: Record<string, bigint>;
  userContributions: Record<string, number[]>;
  tokenInfo: Record<number, TokenInfo>;
  timestamp: number;
}

// Global cache
const globalCache: Cache = {
  projects: {},
  fundingInfo: {},
  contributions: {},
  userContributions: {},
  tokenInfo: {},
  timestamp: 0
};

// Cache expiry time (milliseconds)
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Parse project data
const parseProjectData = (data: any[]): ProjectData => {
  return {
    id: Number(data[0]),
    creator: data[1],
    title: data[2],
    description: data[3],
    tags: data[4],
    metadata: {
      aiEvaluation: data[5][0],
      marketScore: Number(data[5][1]),
      techFeasibility: data[5][2],
      minValuation: Number(data[5][3]),
      maxValuation: Number(data[5][4]),
    },
    status: Number(data[6]),
    createdAt: Number(data[7]),
    updatedAt: Number(data[8]),
  };
};

// Parse funding information
const parseFundingInfo = (data: any[]): FundingInfo => {
  return {
    fundingGoal: data[0],
    raisedAmount: data[1],
    startTime: Number(data[2]),
    endTime: Number(data[3]),
    hasMetFundingGoal: data[4],
    paymentToken: data[5],
  };
};

// Parse token information
const parseTokenInfo = (data: any[]): TokenInfo => {
  return {
    tokenAddress: data[0],
    name: data[1],
    symbol: data[2],
    totalSupply: data[3],
    crowdfundingPool: data[4],
    teamPool: data[5],
    ecosystemPool: data[6],
    createdAt: Number(data[7]),
  };
};

// Format amount, convert wei to ETH and format
const formatAmount = (amount: bigint): string => {
  const ethAmount = Number(amount) / 1e18;
  return ethAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Format token amount
const formatTokenAmount = (amount: bigint): string => {
  return (Number(amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Check if cache is expired
const isCacheExpired = (): boolean => {
  return Date.now() - globalCache.timestamp > CACHE_EXPIRY;
};

// User investments table component - Enhanced with better visuals for dark mode
const UserInvestmentsTable = ({ userInvestments, isLoadingData }: { userInvestments: UserInvestment[], isLoadingData: boolean }) => {
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg text-primary dark:text-primary/90"></span>
      </div>
    );
  }
  
  if (userInvestments.length === 0) {
    return (
      <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50 dark:bg-base-800/50 shadow-inner">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-base-300/50 dark:bg-base-700/50 flex items-center justify-center text-base-content/40 dark:text-base-content/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-secondary/90 dark:from-primary/80 dark:to-secondary/80">No investments yet</h3>
        <p className="mb-4 text-xs opacity-80 dark:opacity-60 sm:text-sm">You haven&apos;t invested in any projects.</p>
        <Link href="/projects" className="btn btn-primary dark:bg-primary/90 dark:hover:bg-primary/80 dark:text-primary-content/90 btn-sm sm:btn-md hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
          Browse Projects
        </Link>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="table w-full table-sm sm:table-md">
        <thead>
          <tr className="bg-base-300/30 dark:bg-base-700/30">
            <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Project</th>
            <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Contribution</th>
            <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Funding Progress</th>
            <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Status</th>
            <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userInvestments.map((investment) => (
            <tr key={investment.projectId} className="hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors duration-300">
              <td>
                <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                  {investment.projectTitle}
                </div>
              </td>
              <td className="text-xs sm:text-sm font-semibold text-accent dark:text-accent/90">${formatAmount(investment.contributionAmount)}</td>
              <td>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <progress 
                      className={`progress w-20 sm:w-24 ${
                        investment.fundingProgress >= 100 
                          ? "progress-success dark:bg-success/80 dark:text-success-content/90" 
                          : "progress-primary dark:bg-primary/80 dark:text-primary-content/90"
                      }`} 
                      value={investment.fundingProgress} 
                      max="100"
                    ></progress>
                    <span className="text-xs font-semibold">{investment.fundingProgress}%</span>
                  </div>
                  <div className="text-xs opacity-70 dark:opacity-60">
                    ${formatAmount(investment.raisedAmount)} / ${formatAmount(investment.fundingGoal)}
                  </div>
                </div>
              </td>
              <td>
                <span
                  className={`badge badge-xs sm:badge-sm ${
                    investment.status === "Active"
                      ? "badge-success dark:bg-success/80 dark:text-success-content/90"
                      : investment.status === "Funded"
                        ? "badge-info dark:bg-info/80 dark:text-info-content/90"
                        : "badge-error dark:bg-error/80 dark:text-error-content/90"
                  }`}
                >
                  {investment.status}
                </span>
              </td>
              <td>
                <Link
                  href={`/projects/${investment.projectId}`}
                  className="btn btn-xs sm:btn-sm btn-outline dark:border-base-600 dark:text-base-content dark:hover:bg-base-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="inline-block">Details</span>
                  </div>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Token unlock progress component - Enhanced with better visuals for dark mode
const TokenReleaseSchedule = ({ tokenReleaseInfo, isLoadingData }: { tokenReleaseInfo: TokenReleaseInfo[], isLoadingData: boolean }) => {
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg text-primary dark:text-primary/90"></span>
      </div>
    );
  }
  
  if (tokenReleaseInfo.length === 0) {
    return (
      <div className="py-6 text-center rounded-lg sm:py-8 bg-base-200/50 dark:bg-base-800/50 shadow-inner">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-base-300/50 dark:bg-base-700/50 flex items-center justify-center text-base-content/40 dark:text-base-content/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-secondary/90 dark:from-primary/80 dark:to-secondary/80">No token releases yet</h3>
        <p className="mb-4 text-xs opacity-80 dark:opacity-60 sm:text-sm">You don&apos;t have any tokens being released.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Token unlock progress table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="table w-full table-sm sm:table-md">
          <thead>
            <tr className="bg-base-300/30 dark:bg-base-700/30">
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Release Date</th>
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Project</th>
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Percentage</th>
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Tokens</th>
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Status</th>
              <th className="text-xs sm:text-sm font-bold text-primary dark:text-primary/90">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokenReleaseInfo.map((info) => (
              <tr key={`${info.projectId}-${info.vestingStartDate}`} className="hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors duration-300">
                <td className="text-xs sm:text-sm">
                  {new Date(info.vestingEndDate * 1000).toLocaleDateString()}
                </td>
                <td>
                  <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                    {info.projectTitle}
                  </div>
                </td>
                <td className="text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <progress 
                      className={`progress w-16 sm:w-20 ${
                        info.percentUnlocked >= 100 
                          ? "progress-success dark:bg-success/80 dark:text-success-content/90" 
                          : "progress-primary dark:bg-primary/80 dark:text-primary-content/90"
                      }`} 
                      value={info.percentUnlocked} 
                      max="100"
                    ></progress>
                    <span className="text-xs font-semibold">{info.percentUnlocked}%</span>
                  </div>
                </td>
                <td className="text-xs sm:text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-accent dark:text-accent/90">{formatTokenAmount(info.unlockedTokens)} / {formatTokenAmount(info.totalTokens)}</span>
                    <span className="text-2xs opacity-70 dark:opacity-60">{info.tokenSymbol}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge badge-xs sm:badge-sm ${
                      info.percentUnlocked >= 100
                        ? "badge-success dark:bg-success/80 dark:text-success-content/90"
                        : info.percentUnlocked > 0
                          ? "badge-info dark:bg-info/80 dark:text-info-content/90"
                          : "badge-warning dark:bg-warning/80 dark:text-warning-content/90"
                    }`}
                  >
                    {info.percentUnlocked >= 100
                      ? "Fully Unlocked"
                      : info.percentUnlocked > 0
                        ? "Unlocking"
                        : "Locked"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-xs sm:btn-sm btn-outline dark:border-base-600 dark:text-base-content dark:hover:bg-base-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => {
                      // Show release schedule
                      const modal = document.getElementById(`modal-${info.projectId}`) as HTMLDialogElement;
                      if (modal) modal.showModal();
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="inline-block">Schedule</span>
                    </div>
                  </button>
                  
                  {/* Release Schedule Modal - Enhanced styling for dark mode */}
                  <dialog id={`modal-${info.projectId}`} className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box bg-base-100 dark:bg-base-900 shadow-2xl border border-base-300 dark:border-base-700">
                      <h3 className="font-bold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">Token Release Schedule</h3>
                      <p className="text-sm mb-4">Project: <span className="font-semibold">{info.projectTitle}</span></p>
                      
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead className="bg-base-300/30 dark:bg-base-700/30">
                            <tr>
                              <th className="text-xs font-bold text-primary dark:text-primary/90">Date</th>
                              <th className="text-xs font-bold text-primary dark:text-primary/90">Percentage</th>
                              <th className="text-xs font-bold text-primary dark:text-primary/90">Tokens</th>
                              <th className="text-xs font-bold text-primary dark:text-primary/90">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.releaseSchedule.map((item, index) => (
                              <tr key={index} className={`${item.isUnlocked ? "bg-success/10 dark:bg-success/5" : ""} hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors duration-300`}>
                                <td>{new Date(item.date * 1000).toLocaleDateString()}</td>
                                <td>{item.percentage}%</td>
                                <td>
                                  <span className={item.isUnlocked ? "text-success dark:text-success/90 font-semibold" : ""}>
                                    {formatTokenAmount(item.tokenAmount)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge badge-xs ${
                                      item.isUnlocked 
                                        ? "badge-success dark:bg-success/80 dark:text-success-content/90" 
                                        : "badge-warning dark:bg-warning/80 dark:text-warning-content/90"
                                    }`}
                                  >
                                    {item.isUnlocked ? "Unlocked" : "Locked"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="modal-action">
                        <button className="btn btn-outline dark:border-base-600 dark:text-base-content dark:hover:bg-base-700 hover:scale-105 transition-transform duration-300" onClick={() => (document.getElementById(`modal-${info.projectId}`) as HTMLDialogElement)?.close()}>
                          Close
                        </button>
                      </div>
                    </div>
                  </dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  // 移除useAccount()调用，改用模拟数据
  const address = "0xMock_Address_For_Testing_Only";
  const [activeTab, setActiveTab] = useState("projects");
  const [projectsCount, setProjectsCount] = useState(3);
  const [tasksCount, setTasksCount] = useState(5);
  const [tokenBalance, setTokenBalance] = useState({ unlocked: 0, total: 0 });
  const [investmentDistribution, setInvestmentDistribution] = useState<TagDistribution>({});
  const [investmentStatusDistribution, setInvestmentStatusDistribution] = useState({
    active: 0,
    funded: 0,
    failed: 0,
    pending: 0
  });
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [tokenReleaseInfo, setTokenReleaseInfo] = useState<TokenReleaseInfo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingTokenData, setIsLoadingTokenData] = useState(true);
  const { readMethod } = useContractRead();

  // 其他逻辑保持不变，但使用模拟数据
  // ...

  return (
    <div className="flex flex-col pt-20 min-h-screen sm:pt-24 animate-fade-in">
      {/* SVG Background with subtle pattern */}
      <div className="fixed inset-0 z-[-1] opacity-5 dark:opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboardGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50,0 L0,0 L0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="currentColor" />
            </pattern>
            <pattern id="dashboardDots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboardDots)" />
          <rect width="100%" height="100%" fill="url(#dashboardGrid)" />
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </svg>
      </div>

      <div className="container px-4 mx-auto">
        {/* Header with enhanced glass effect - Dark mode improved */}
        <div className="mb-8 backdrop-blur-sm bg-base-100/40 dark:bg-base-900/40 p-6 rounded-2xl shadow-xl border border-base-200 dark:border-base-800 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative">
              <h1 className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-primary/90 dark:to-secondary/90">
                Dashboard Overview
              </h1>
              <div className="absolute -bottom-2 left-0 w-1/2 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 bg-base-200/50 dark:bg-base-800/50 rounded-full px-4 py-2 text-sm shadow-sm hover:shadow transition-all duration-300">
              <div className="w-2.5 h-2.5 bg-success dark:bg-success/80 rounded-full animate-pulse"></div>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Analytics Section - Dark mode improved */}
        <div className="mb-8 card bg-base-100 dark:bg-base-900 shadow-xl p-4 sm:p-6 border border-base-200/50 dark:border-base-700/50 hover:border-base-300/50 dark:hover:border-base-600/50 transition-all duration-300">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Portfolio Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left column - Investment Breakdown */}
            <div className="md:col-span-1">
              {/* Investment Breakdown Card - Enhanced with better visuals for dark mode */}
              <div className="card bg-base-200/50 dark:bg-base-800/50 shadow-xl h-full hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                <div className="card-body p-3 sm:p-4 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="card-title text-base bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-secondary/90 dark:from-primary/80 dark:to-secondary/80">Investment Breakdown by Tags</h3>
                    
                    <div className="flex flex-col gap-3 mt-4">
                      {/* Horizontal Bar Chart */}
                      <div className="space-y-3">
                        {Object.keys(investmentDistribution).length === 0 ? (
                          <div className="text-sm text-center py-4 opacity-70 dark:opacity-60">No tag data available</div>
                        ) : (
                          <>
                            {/* Calculate total for percentage */}
                            {(() => {
                              const totalTags = Object.values(investmentDistribution).reduce((sum, count) => sum + count, 0);
                              
                              // Get top 8 tags by count
                              const topTags = Object.entries(investmentDistribution)
                                .sort(([, countA], [, countB]) => countB - countA)
                                .slice(0, 8);
                              
                              // Color palette for bars
                              const colors = [
                                "bg-primary", "bg-secondary", "bg-accent", 
                                "bg-info", "bg-success", "bg-warning", 
                                "bg-error", "bg-neutral"
                              ];
                              
                              return topTags.map(([tag, count], index) => (
                                <div key={tag}>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-medium flex items-center gap-1.5">
                                      <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]} inline-block shadow-sm`}></span>
                                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </span>
                                    <span className="text-sm">{count}</span>
                                  </div>
                                  <div className="w-full bg-base-300 dark:bg-base-700 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div 
                                      className={`${colors[index % colors.length]} h-3 rounded-full shadow-inner transition-all duration-500`}
                                      style={{ width: `${(count / totalTags) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ));
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary Stats - Moved to bottom for alignment */}
                  <div className="flex justify-between items-center mt-auto pt-3 text-sm text-center">
                    <div className="bg-base-300/50 dark:bg-base-700/50 rounded-lg px-3 py-2 hover:bg-base-300/70 dark:hover:bg-base-700/70 transition-colors duration-300">
                      <div className="font-bold text-lg text-primary dark:text-primary/90">{projectsCount}</div>
                      <div className="opacity-70 dark:opacity-60">Total</div>
                    </div>
                    <div className="bg-base-300/50 dark:bg-base-700/50 rounded-lg px-3 py-2 hover:bg-base-300/70 dark:hover:bg-base-700/70 transition-colors duration-300">
                      <div className="font-bold text-lg text-success dark:text-success/90">{investmentStatusDistribution.funded}</div>
                      <div className="opacity-70 dark:opacity-60">Funded</div>
                    </div>
                    <div className="bg-base-300/50 dark:bg-base-700/50 rounded-lg px-3 py-2 hover:bg-base-300/70 dark:hover:bg-base-700/70 transition-colors duration-300">
                      <div className="font-bold text-lg text-info dark:text-info/90">{investmentStatusDistribution.active}</div>
                      <div className="opacity-70 dark:opacity-60">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Stats Cards */}
            <div className="md:col-span-1 flex flex-col h-full">
              <div className="grid grid-rows-3 gap-3 h-full">
                {/* Projects Backed Card - Enhanced with better visuals for dark mode */}
                <div className="card bg-gradient-to-br from-base-100 to-base-200 dark:from-base-900 dark:to-base-800 hover:from-primary/10 hover:to-primary/20 dark:hover:from-primary/20 dark:hover:to-primary/10 border border-primary/20 dark:border-primary/10 transition-all duration-300 group shadow-md hover:shadow-xl">
                  <div className="card-body p-3 flex flex-row items-center justify-between h-full">
                    <div className="flex flex-col justify-between h-full">
                      <h2 className="text-base font-medium text-base-content/70 dark:text-base-content/60">Projects Backed</h2>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-primary dark:text-primary/90">{projectsCount}</p>
                        <div className="badge badge-sm badge-primary dark:bg-primary/90 dark:text-primary-content/90">Active</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-2.5 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary dark:text-primary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tasks Participated Card - Enhanced with better visuals for dark mode */}
                <div className="card bg-gradient-to-br from-base-100 to-base-200 dark:from-base-900 dark:to-base-800 hover:from-secondary/10 hover:to-secondary/20 dark:hover:from-secondary/20 dark:hover:to-secondary/10 border border-secondary/20 dark:border-secondary/10 transition-all duration-300 group shadow-md hover:shadow-xl">
                  <div className="card-body p-3 flex flex-row items-center justify-between h-full">
                    <div className="flex flex-col justify-between h-full">
                      <h2 className="text-base font-medium text-base-content/70 dark:text-base-content/60">Tasks Participated</h2>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-secondary dark:text-secondary/90">{tasksCount}</p>
                        <div className="badge badge-sm badge-secondary dark:bg-secondary/90 dark:text-secondary-content/90">Total</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-secondary/10 dark:bg-secondary/20 p-2.5 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30 transition-colors duration-300 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary dark:text-secondary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Token Balance Card - Enhanced with better visuals for dark mode */}
                <div className="card bg-gradient-to-br from-base-100 to-base-200 dark:from-base-900 dark:to-base-800 hover:from-accent/10 hover:to-accent/20 dark:hover:from-accent/20 dark:hover:to-accent/10 border border-accent/20 dark:border-accent/10 transition-all duration-300 group shadow-md hover:shadow-xl">
                  <div className="card-body p-3 flex flex-row items-center justify-between h-full">
                    <div className="flex flex-col justify-between h-full">
                      <h2 className="text-base font-medium text-base-content/70 dark:text-base-content/60">Token Balance</h2>
                      <div>
                        <div className="flex flex-col">
                          <p className="text-2xl font-bold text-accent dark:text-accent/90 leading-none mb-1">{tokenBalance.unlocked.toLocaleString()}</p>
                          <p className="text-xs text-base-content/60 dark:text-base-content/50">of {tokenBalance.total.toLocaleString()}</p>
                        </div>
                        <div className="w-24 bg-base-300 dark:bg-base-700 h-1.5 rounded-full overflow-hidden mt-1.5 shadow-inner">
                          <div 
                            className="bg-accent dark:bg-accent/90 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${tokenBalance.total > 0 ? (tokenBalance.unlocked / tokenBalance.total) * 100 : 0}%`,
                              boxShadow: "0 0 8px rgba(var(--accent), 0.4)"
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-accent/10 dark:bg-accent/20 p-2.5 group-hover:bg-accent/20 dark:group-hover:bg-accent/30 transition-colors duration-300 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent dark:text-accent/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Recent Activity */}
            <div className="md:col-span-1">
              <div className="card bg-gradient-to-br from-base-100 to-base-200 dark:from-base-900 dark:to-base-800 hover:from-base-200/50 hover:to-base-300/50 dark:hover:from-base-800/50 dark:hover:to-base-700/50 border border-base-300/50 dark:border-base-700/50 transition-all duration-300 h-full group shadow-md hover:shadow-xl">
                <div className="card-body p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-base-content/70 dark:text-base-content/60">Recent Activity</h3>
                    <div className="rounded-xl bg-base-300/30 dark:bg-base-700/30 p-2 group-hover:bg-base-300/40 dark:group-hover:bg-base-700/40 transition-colors duration-300 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70 dark:text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Default state - No activity with enhanced styling for dark mode */}
                  <div className="flex flex-col items-center justify-center flex-grow py-8">
                    <div className="w-16 h-16 rounded-2xl bg-base-300/50 dark:bg-base-700/50 flex items-center justify-center text-base-content/40 dark:text-base-content/30 mb-4 group-hover:bg-base-300/70 dark:group-hover:bg-base-700/70 transition-colors duration-300 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-sm text-base-content/70 dark:text-base-content/60 text-center mb-2">No Recent Activity</h4>
                    <p className="text-xs text-base-content/50 dark:text-base-content/40 text-center max-w-[200px]">
                      Your activity will appear here once you start interacting with projects
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs - Enhanced styling for dark mode */}
        <div className="card bg-base-100 dark:bg-base-900 shadow-xl overflow-hidden border border-base-200/50 dark:border-base-700/50 hover:border-base-300/50 dark:hover:border-base-600/50 transition-all duration-300">
          {/* Custom Tabs with Animated Indicator - Improved version for dark mode */}
          <div className="bg-base-200/50 dark:bg-base-800/50 p-1.5 rounded-t-2xl border-b border-base-300 dark:border-base-700">
            <div className="flex relative">
              <button
                className={`flex-1 py-3.5 px-4 text-center relative z-10 transition-all duration-300 ${activeTab === "projects" ? "text-primary dark:text-primary/90 font-medium" : "text-base-content/70 dark:text-base-content/60 hover:text-base-content dark:hover:text-base-content/90"}`}
                onClick={() => setActiveTab("projects")}
              >
                <div className="flex justify-center items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === "projects" ? "text-primary dark:text-primary/90" : "text-base-content/70 dark:text-base-content/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>My Investments</span>
                </div>
              </button>
              <button
                className={`flex-1 py-3.5 px-4 text-center relative z-10 transition-all duration-300 ${activeTab === "tasks" ? "text-primary dark:text-primary/90 font-medium" : "text-base-content/70 dark:text-base-content/60 hover:text-base-content dark:hover:text-base-content/90"}`}
                onClick={() => setActiveTab("tasks")}
              >
                <div className="flex justify-center items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === "tasks" ? "text-primary dark:text-primary/90" : "text-base-content/70 dark:text-base-content/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Tasks</span>
                </div>
              </button>
              {/* Animated Tab Indicator - Enhanced for dark mode */}
              <div 
                className={`absolute bottom-0 h-0.5 bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90 transition-all duration-300 rounded-full`}
                style={{ 
                  left: activeTab === "projects" ? "0%" : "50%", 
                  width: "50%",
                  transform: activeTab === "projects" ? "translateX(0%)" : "translateX(0%)"
                }}
              ></div>
            </div>
          </div>

          {/* Content Area - Enhanced styling for dark mode */}
          <div className="p-6">
            {/* Projects Tab Content */}
            {activeTab === "projects" && (
              <div className="space-y-8">
                {/* Investments Section - Enhanced styling for dark mode */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      My Investments
                    </h2>
                    <Link href="/projects" className="btn btn-primary dark:bg-primary/90 dark:hover:bg-primary/80 dark:text-primary-content/90 btn-sm sm:btn-md hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg">
                      <div className="flex items-center justify-center gap-2 h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                        <span className="inline-block">Invest More</span>
                      </div>
                    </Link>
                  </div>
                  <div className="bg-base-200/30 dark:bg-base-800/30 rounded-xl p-1 shadow-inner">
                    <UserInvestmentsTable 
                      userInvestments={userInvestments} 
                      isLoadingData={isLoadingData} 
                    />
                  </div>
                </div>

                {/* Token Release Schedule Section - Enhanced styling for dark mode */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Token Release Schedule
                    </h2>
                    <button 
                      className="btn btn-outline dark:border-base-600 dark:text-base-content dark:hover:bg-base-700 btn-sm hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md"
                      onClick={() => {
                        const modal = document.getElementById('vesting-info-modal') as HTMLDialogElement;
                        if (modal) modal.showModal();
                      }}
                    >
                      <div className="flex items-center justify-center gap-2 h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                        <span className="inline-block">How Vesting Works</span>
                      </div>
                    </button>
                    
                    {/* Vesting Info Modal - Enhanced styling for dark mode */}
                    <dialog id="vesting-info-modal" className="modal modal-bottom sm:modal-middle">
                      <div className="modal-box bg-base-100 dark:bg-base-900 shadow-2xl border border-base-300 dark:border-base-700">
                        <h3 className="font-bold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">How Token Vesting Works</h3>
                        
                        <div className="space-y-4">
                          <p className="text-sm">
                            Token vesting is a process where tokens are gradually released over time according to a predetermined schedule.
                          </p>
                          
                          <div className="bg-base-200 dark:bg-base-800 p-4 rounded-lg shadow-inner">
                            <h4 className="font-semibold mb-2 text-primary dark:text-primary/90">Key Concepts:</h4>
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              <li><span className="font-medium">Vesting Period:</span> The total time over which your tokens will be released.</li>
                              <li><span className="font-medium">Release Schedule:</span> The specific dates and percentages of tokens to be unlocked.</li>
                              <li><span className="font-medium">Cliff Period:</span> An initial period where no tokens are released, followed by the first release.</li>
                            </ul>
                          </div>
                          
                          <div className="bg-base-200 dark:bg-base-800 p-4 rounded-lg shadow-inner">
                            <h4 className="font-semibold mb-2 text-secondary dark:text-secondary/90">Example Schedule:</h4>
                            <div className="overflow-x-auto">
                              <table className="table table-sm w-full">
                                <thead>
                                  <tr>
                                    <th>Time</th>
                                    <th>Release</th>
                                    <th>Total Unlocked</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="hover:bg-base-300/30 dark:hover:bg-base-700/30 transition-colors duration-300">
                                    <td>TGE (Token Generation Event)</td>
                                    <td>10%</td>
                                    <td>10%</td>
                                  </tr>
                                  <tr className="hover:bg-base-300/30 dark:hover:bg-base-700/30 transition-colors duration-300">
                                    <td>3 months after TGE</td>
                                    <td>15%</td>
                                    <td>25%</td>
                                  </tr>
                                  <tr className="hover:bg-base-300/30 dark:hover:bg-base-700/30 transition-colors duration-300">
                                    <td>6 months after TGE</td>
                                    <td>25%</td>
                                    <td>50%</td>
                                  </tr>
                                  <tr className="hover:bg-base-300/30 dark:hover:bg-base-700/30 transition-colors duration-300">
                                    <td>12 months after TGE</td>
                                    <td>50%</td>
                                    <td>100%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        <div className="modal-action">
                          <button className="btn btn-outline dark:border-base-600 dark:text-base-content dark:hover:bg-base-700 hover:scale-105 transition-transform duration-300" onClick={() => (document.getElementById('vesting-info-modal') as HTMLDialogElement)?.close()}>
                            Close
                          </button>
                        </div>
                      </div>
                    </dialog>
                  </div>
                  <div className="bg-base-200/30 dark:bg-base-800/30 rounded-xl p-1 shadow-inner">
                    <TokenReleaseSchedule 
                      tokenReleaseInfo={tokenReleaseInfo}
                      isLoadingData={isLoadingTokenData}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab Content - Enhanced styling for dark mode */}
            {activeTab === "tasks" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Tasks
                  </h2>
                  <Link href="/projects" className="btn btn-primary dark:bg-primary/90 dark:hover:bg-primary/80 dark:text-primary-content/90 btn-sm sm:btn-md hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg">
                    <div className="flex items-center justify-center gap-2 h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                      <span className="inline-block">Find Tasks</span>
                    </div>
                  </Link>
                </div>
                <div className="bg-base-200/30 dark:bg-base-800/30 rounded-xl p-1 shadow-inner">
                  <UserTasksTable />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-base-100 dark:bg-base-900">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary dark:text-primary/90"></span>
          <p className="text-sm text-base-content/70 dark:text-base-content/60 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;
