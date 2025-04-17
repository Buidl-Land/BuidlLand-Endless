// 模拟Aptos钱包hooks
export function useAptosWallet() {
  return {
    account: {
      address: "0xMock_Aptos_Address_For_Testing",
      publicKey: "mockPublicKey",
    },
    connected: true,
    network: "testnet",
    connect: async () => true,
    disconnect: async () => true,
    signAndSubmitTransaction: async () => ({ hash: "0xMockAptosTransactionHash" }),
    signTransaction: async () => ({ hash: "0xMockAptosTransactionHash" }),
    // 其他需要的方法...
  };
} 