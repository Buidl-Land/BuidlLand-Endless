export * from "./useDiamondContract";
export const useContractRead = () => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

export const useContractWrite = () => {
  return {
    writeAsync: async () => ({ hash: "0xMockTransactionHash" }),
    data: null,
    isLoading: false,
    error: null,
    write: () => {},
  };
};