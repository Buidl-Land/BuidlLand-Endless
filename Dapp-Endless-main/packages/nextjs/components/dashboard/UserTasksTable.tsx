"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Task status enum
enum TaskStatus {
  Open,
  Assigned,
  InProgress,
  Completed,
  Verified,
  Cancelled
}

// Mock task data
interface TaskData {
  id: string;
  projectId: number;
  taskId: number;
  title: string;
  description?: string;
  reward: number;
  status: TaskStatus;
  assignee?: string;
  deadline: number;
  createdAt: number;
  updatedAt: number;
}

// Mock task cache
const taskCache = {
  tasks: {} as Record<string, TaskData>,
  projectTaskCounts: {} as Record<number, number>,
  timestamp: 0,
};

// Check if cache is expired
const isCacheExpired = (): boolean => {
  const CACHE_TTL = 60 * 1000; // 1 minute
  return Date.now() - taskCache.timestamp > CACHE_TTL;
};

// Format amount, convert wei to USDC and format
const formatAmount = (amount: bigint): string => {
  const usdcAmount = Number(amount) / 1e18;
  return usdcAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Get task status text
const getTaskStatusText = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Open:
      return "Open";
    case TaskStatus.Assigned:
      return "Assigned";
    case TaskStatus.InProgress:
      return "In Progress";
    case TaskStatus.Completed:
      return "Completed";
    case TaskStatus.Verified:
      return "Verified";
    case TaskStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown Status";
  }
};

// Get task status style
const getTaskStatusStyle = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Open:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400";
    case TaskStatus.Assigned:
    case TaskStatus.InProgress:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-400";
    case TaskStatus.Completed:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-20 dark:text-yellow-400";
    case TaskStatus.Verified:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400";
    case TaskStatus.Cancelled:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:bg-opacity-20 dark:text-gray-400";
  }
};

export const UserTasksTable = () => {
  // Replace useAccount with mock address
  const mockAddress = "0x1234...5678";
  // Remove contract related hooks
  const [userTasks, setUserTasks] = useState<TaskData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Replace blockchain interactions with mock data
  useEffect(() => {
    // Mock fetching user tasks
    const mockTasks: TaskData[] = [
      {
        id: "1",
        projectId: 1,
        taskId: 1,
        title: "Design UI Mockups",
        description: "Create UI mockups for the dashboard",
        reward: 500,
        status: TaskStatus.Completed,
        assignee: mockAddress,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        id: "2",
        projectId: 2,
        taskId: 2,
        title: "Implement Smart Contract",
        description: "Implement core functionality in smart contract",
        reward: 1000,
        status: TaskStatus.InProgress,
        assignee: mockAddress,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
    ];
    
    setUserTasks(mockTasks);
    setIsLoadingData(false);
  }, []);

  // Render loading state
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Render empty state
  if (userTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Tasks</h2>
      </div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Project/Task</th>
            <th>Status</th>
            <th>Reward</th>
            <th>Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userTasks.map((task) => (
            <tr key={`${task.projectId}-${task.taskId}`} className="hover">
              <td>
                <div>
                  <div className="font-bold">{task.title}</div>
                  <div className="text-sm opacity-70 truncate max-w-xs">{task.description}</div>
                </div>
              </td>
              <td>
                <span className={`badge ${getTaskStatusStyle(task.status)}`}>
                  {getTaskStatusText(task.status)}
                </span>
              </td>
              <td className="font-semibold">{formatAmount(BigInt(task.reward)) as string} USDC</td>
              <td>
                {task.deadline > 0
                  ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true })
                  : "No deadline"}
              </td>
              <td>
                <Link
                  href={`/projects/${task.projectId}/tasks/${task.taskId}`}
                  className="btn btn-sm btn-outline"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};