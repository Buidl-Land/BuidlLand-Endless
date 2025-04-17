import { EndlessConfig, Network, AccountAddress } from "@endlesslab/endless-ts-sdk";
import { Endless } from "@endlesslab/endless-ts-sdk";
import { 
  EndlessJsSdk, 
  UserResponseStatus, 
  EndlessSignAndSubmitTransactionInput,
  EndLessSDKEvent
} from "@endlesslab/endless-web3-sdk";
import {
  MockCrowdfundingModule,
  MODULE_ADDRESS,
  TaskStatus
} from "../constants";

// 初始化SDK实例
export const initializeEndlessSdk = () => {
  const sdk = new EndlessJsSdk({
    network: Network.TESTNET,
    colorMode: 'light',
    windowWidth: 360
  });
  
  return sdk;
};

// 连接钱包并获取地址
export const connectWallet = async (sdk: EndlessJsSdk) => {
  try {
    const connectRes = await sdk.connect();
    
    if (connectRes.status === UserResponseStatus.APPROVED) {
      console.log('Wallet connected:', connectRes.args.account);
      return connectRes.args;
    } else {
      console.error('Connection failed:', connectRes.message);
      return null;
    }
  } catch (error) {
    console.error('Connection error:', error);
    return null;
  }
};

// 创建Endless客户端实例
export const createEndlessClient = (network = Network.TESTNET) => {
  const config = new EndlessConfig({
    network: network,
    fullnode: "https://rpc-test.endless.link/v1",
    indexer: "https://idx-test.endless.link/v1",
  });
  
  return new Endless(config);
};

// 众筹合约交互函数
export const CrowdfundingFunctions = (sdk: EndlessJsSdk) => {
  // 创建Endless客户端
  const endless = createEndlessClient();
  
  // 贡献资金
  const contributeFunding = async (amount: number) => {
    try {
      const transaction: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.CONTRIBUTE_FUNDING}`,
          functionArguments: [amount],
        }
      };
      
      const result = await sdk.signAndSubmitTransaction(transaction);
      
      if (result.status === UserResponseStatus.APPROVED) {
        console.log('Transaction submitted:', result.args.hash);
        await endless.waitForTransaction({
          transactionHash: result.args.hash,
        });
        return result.args.hash;
      } else {
        console.error('Transaction rejected:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Transaction error:', error);
      return null;
    }
  };
  
  // 存入资金
  const depositFunding = async (amount: number) => {
    try {
      const transaction: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.DEPOSIT_FUNDING}`,
          functionArguments: [BigInt(amount * 1e8)],
        }
      };
      
      const result = await sdk.signAndSubmitTransaction(transaction);
      
      if (result.status === UserResponseStatus.APPROVED) {
        console.log('Deposit funding transaction submitted:', result.args.hash);
        await endless.waitForTransaction({
          transactionHash: result.args.hash,
        });
        return result.args.hash;
      } else {
        console.error('Deposit funding transaction rejected:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Deposit funding transaction error:', error);
      return null;
    }
  };
  
  // 创建任务
  const createTask = async (taskId: string, description: string, reward: number) => {
    try {
      const transaction: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.CREATE_TASK}`,
          functionArguments: [taskId, description, reward],
        }
      };
      
      const result = await sdk.signAndSubmitTransaction(transaction);
      
      if (result.status === UserResponseStatus.APPROVED) {
        console.log('Create task transaction submitted:', result.args.hash);
        await endless.waitForTransaction({
          transactionHash: result.args.hash,
        });
        return result.args.hash;
      } else {
        console.error('Create task transaction rejected:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Create task transaction error:', error);
      return null;
    }
  };
  
  // 分配任务
  const assignTask = async (taskId: string) => {
    try {
      const transaction: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.ASSIGN_TASK}`,
          functionArguments: [taskId]
        }
      };
      
      const result = await sdk.signAndSubmitTransaction(transaction);
      
      if (result.status === UserResponseStatus.APPROVED) {
        console.log('Assign task transaction submitted:', result.args.hash);
        await endless.waitForTransaction({
          transactionHash: result.args.hash,
        });
        return result.args.hash;
      } else {
        console.error('Assign task transaction rejected:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Assign task transaction error:', error);
      return null;
    }
  };
  
  // 开始任务
  const startTask = async (taskId: string) => {
    try {
      const transaction: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.START_TASK}`,
          functionArguments: [taskId],
        }
      };
      
      const result = await sdk.signAndSubmitTransaction(transaction);
      
      if (result.status === UserResponseStatus.APPROVED) {
        console.log('Start task transaction submitted:', result.args.hash);
        await endless.waitForTransaction({
          transactionHash: result.args.hash,
        });
        return result.args.hash;
      } else {
        console.error('Start task transaction rejected:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Start task transaction error:', error);
      return null;
    }
  };
  
  // 查询函数 - 获取任务状态
  const getTaskState = async (taskId: string): Promise<number> => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.GET_TASK_STATE}` as `${string}::${string}::${string}`,
        functionArguments: [taskId],
      };
      
      const response = await endless.view({ payload });
      return response as unknown as number;
    } catch (error) {
      console.error('Get task state error:', error);
      return -1;
    }
  };
  
  // 查询函数 - 获取众筹V2
  const getCrowdFundingV2 = async (): Promise<number> => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.GET_CROWD_FUNDING_V2}` as `${string}::${string}::${string}`,
        functionArguments: [],
      };
      
      const response = await endless.view({ payload });
      return response as unknown as number;
    } catch (error) {
      console.error('Get crowd funding V2 error:', error);
      return -1;
    }
  };
  
  // 查询函数 - 获取用户分配的任务
  const getUserAssignTask = async (address: string): Promise<any> => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.GET_USER_ASSIGN_TASK}` as `${string}::${string}::${string}`,
        functionArguments: [address],
      };
      
      const response = await endless.view({ payload });
      return response;
    } catch (error) {
      console.error('Get user assign task error:', error);
      return null;
    }
  };
  
  // 查询函数 - 获取任务信息
  const getTaskInfo = async (taskId: string): Promise<any> => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MockCrowdfundingModule.MODULE_NAME}::${MockCrowdfundingModule.FUNCTIONS.GET_TASK_INFO}` as `${string}::${string}::${string}`,
        functionArguments: [taskId],
      };
      
      const response = await endless.view({ payload });
      return response;
    } catch (error) {
      console.error('Get task info error:', error);
      return null;
    }
  };
  
  return {
    contributeFunding,
    depositFunding,
    createTask,
    assignTask,
    startTask,
    getTaskState,
    getCrowdFundingV2,
    getUserAssignTask,
    getTaskInfo
  };
};

// 事件监听器
export const setupEventListeners = (sdk: EndlessJsSdk) => {
  // 初始化成功
  sdk.on(EndLessSDKEvent.INIT, () => {
    console.log('Endless SDK initialized successfully');
  });
  
  // 账户变更
  sdk.on(EndLessSDKEvent.ACCOUNT_CHANGE, (accountInfo) => {
    console.log('Account changed:', accountInfo);
  });
  
  // 网络变更
  sdk.on(EndLessSDKEvent.NETWORK_CHANGE, (networkInfo) => {
    console.log('Network changed:', networkInfo);
  });
  
  // 连接
  sdk.on(EndLessSDKEvent.CONNECT, (accountInfo) => {
    console.log('Connected to wallet:', accountInfo);
  });
  
  // 断开连接
  sdk.on(EndLessSDKEvent.DISCONNECT, () => {
    console.log('Disconnected from wallet');
  });
};

// 导出任务状态常量，方便UI访问
export { TaskStatus };

// 默认导出主要功能
export default {
  initializeEndlessSdk,
  connectWallet,
  createEndlessClient,
  CrowdfundingFunctions,
  setupEventListeners
};