"use client";

import { initializeEndlessSdk, setupEventListeners } from "../../contracts/index";
import { EndlessJsSdk, UserResponseStatus } from "@endlesslab/endless-web3-sdk";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";

// Create a context for Endless wallet
interface EndlessWalletContextType {
  wallet: EndlessJsSdk | null;
  address: string;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const EndlessWalletContext = createContext<EndlessWalletContextType>({
  wallet: null,
  address: '',
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: async () => {},
});

export const useEndlessWallet = () => useContext(EndlessWalletContext);

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<EndlessJsSdk | null>(null);
  const [address, setAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Initialize the wallet SDK
  useEffect(() => {
    try {
      const sdk = initializeEndlessSdk();
      setWallet(sdk);

      // Setup event listeners
      if (sdk) {
        setupEventListeners(sdk);
        
        // Automatically try to reconnect if previously connected
        const checkConnection = async () => {
          try {
            const network = await sdk.getNetwork();
            if (network.status === UserResponseStatus.APPROVED && network.args?.account) {
              setAddress(network.args.account);
              setConnected(true);
            }
          } catch (error) {
            console.error("Auto-connect check failed:", error);
          }
        };
        
        checkConnection();
      }
    } catch (error) {
      console.error("Failed to initialize Endless wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize wallet adapter",
      });
    }
  }, [toast]);

  const connect = async () => {
    if (!wallet) return;
    
    try {
      setConnecting(true);
      const result = await wallet.connect();
      
      if (result.status === UserResponseStatus.APPROVED) {
        setAddress(result.args.account);
        setConnected(true);
        
        toast({
          title: "Success",
          description: "Wallet connected successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect wallet",
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
      });
    } finally {
      setConnecting(false);
    }
  };
  
  const disconnect = async () => {
    if (!wallet) return;
    
    try {
      await wallet.disconnect();
      setAddress('');
      setConnected(false);
      
      toast({
        title: "Success",
        description: "Wallet disconnected successfully",
      });
    } catch (error) {
      console.error("Wallet disconnection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect wallet",
      });
    }
  };

  const value = {
    wallet,
    address,
    connected,
    connecting,
    connect,
    disconnect,
  };

  return (
    <EndlessWalletContext.Provider value={value}>
      {children}
    </EndlessWalletContext.Provider>
  );
};
