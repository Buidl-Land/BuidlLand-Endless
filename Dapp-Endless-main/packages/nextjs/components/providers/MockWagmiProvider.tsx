"use client";

import { createContext, useContext, PropsWithChildren } from "react";

// 扩展模拟的Wagmi上下文
const WagmiContext = createContext({
  config: {
    chains: [],
  },
});

// 模拟账户钩子
export function useAccount() {
  return {
    address: "0xMock_Address_For_Testing_Only",
    isConnecting: false,
    isDisconnected: false,
    isConnected: true,
    status: "connected",
  };
}

// 模拟公共客户端钩子
export function usePublicClient({ chainId } = {}) {
  return {
    getCode: async () => "0x1234", // 模拟合约代码存在
    getBlockNumber: async () => BigInt(1),
    // 添加其他可能需要的方法
  };
}

// 模拟合约读取钩子
export function useContractRead() {
  return {
    data: null,
    isLoading: false,
    isSuccess: true,
    error: null,
  };
}

// 模拟合约写入钩子
export function useContractWrite() {
  return {
    writeAsync: async () => ({ hash: "0xMockTransactionHash" }),
    data: null,
    isLoading: false,
    isSuccess: true,
    error: null,
    write: () => {},
  };
}

// 模拟WagmiProvider
export const MockWagmiProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiContext.Provider value={{ config: { chains: [] } }}>
      {children}
    </WagmiContext.Provider>
  );
}; 