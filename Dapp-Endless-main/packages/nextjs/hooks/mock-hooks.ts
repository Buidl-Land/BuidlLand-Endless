// 模拟useScaffoldContract
export function useScaffoldContract() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

// 模拟useScaffoldContractRead
export function useScaffoldContractRead() {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: async () => {},
  };
}

// 模拟useScaffoldContractWrite
export function useScaffoldContractWrite() {
  return {
    writeAsync: async () => ({ hash: "0xMockTransactionHash" }),
    data: null,
    isLoading: false,
    error: null,
    write: () => {},
  };
}

// 模拟useScaffoldEventSubscriber
export function useScaffoldEventSubscriber() {
  return null;
}

// 模拟useScaffoldEventHistory
export function useScaffoldEventHistory() {
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: async () => {},
  };
}

// 模拟其他可能需要的hooks... 