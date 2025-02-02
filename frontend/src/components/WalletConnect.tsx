import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

declare global {
  interface Window {
    ethereum?: any;
    onConnect: (address: string) => void;
  }
}


export const WalletConnect = () => {
  const { address, setAddress } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please install MetaMask",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect wallet",
      });
    }
    setIsConnecting(false);
  };

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
    >
      <Wallet className="h-4 w-4" />
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
};
