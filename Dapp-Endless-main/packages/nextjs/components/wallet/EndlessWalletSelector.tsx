"use client";

import { useState, useRef, useEffect } from "react";
import { EndlessJsSdk, UserResponseStatus, EndLessSDKEvent } from "@endlesslab/endless-web3-sdk";
import { Button } from "../ui/button";
import { ChevronDown, Copy, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
import { initializeEndlessSdk } from "../../contracts/index";

// Helper function to format address
const formatAddress = (address?: string): string => {
  if (!address) return "Connect Wallet";
  
  // Ensure address is string
  if (typeof address !== 'string') {
    return "Invalid Address";
  }
  
  // Ensure address is long enough to truncate
  if (address.length < 10) return address;
  
  // Truncate address
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export function EndlessWalletSelector() {
  const [wallet, setWallet] = useState<EndlessJsSdk | null>(null);
  const [address, setAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (wallet) {
      // Set up event listeners
      wallet.on(EndLessSDKEvent.ACCOUNT_CHANGE, (accountInfo) => {
        setAddress(accountInfo.account);
      });
      
      wallet.on(EndLessSDKEvent.DISCONNECT, () => {
        setConnected(false);
        setAddress('');
      });
    }
  }, [wallet]);

  const connectWallet = async () => {
    try {
      // Initialize SDK
      const sdk = initializeEndlessSdk();
      
      // Connect wallet
      const connectResult = await sdk.connect();
      
      if (connectResult.status === UserResponseStatus.APPROVED) {
        setWallet(sdk);
        setAddress(connectResult.args.account);
        setConnected(true);
        
        toast({
          title: "Success",
          description: "Wallet connected successfully",
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
      });
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
        setWallet(null);
        setAddress('');
        setConnected(false);
        
        toast({
          title: "Success",
          description: "Wallet disconnected successfully",
        });
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
        toast({
          variant: "destructive", 
          title: "Error",
          description: "Failed to disconnect wallet. Please try again.",
        });
      }
    }
  };

  const openWallet = () => {
    if (wallet) {
      wallet.open();
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Success",
        description: "Copied wallet address to clipboard.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy wallet address.",
      });
    }
  };

  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          {formatAddress(address) || "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={copyAddress} className="gap-2">
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={openWallet} className="gap-2">
          <User className="h-4 w-4" /> Open Wallet
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={disconnectWallet} className="gap-2">
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={connectWallet}>Connect Wallet</Button>
  );
} 