import { useState, useEffect } from "react";
import { AssetBalance } from "@/components/AssetBalance";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TransferForm } from "@/components/TransferForm";
import { TransactionHistory } from "@/components/TransactionHistory";

const Index = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "MetaMask or any Web3 wallet is not installed",
      });
      return;
    }

    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      if (error.code === -32002) {
        toast({
          variant: "destructive",
          title: "Pending Request",
          description: "A connection request is already pending. Please check MetaMask.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect wallet",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    toast({
      variant: "destructive",
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    });
  };

  useEffect(() => {
    const checkConnectedWallet = async () => {
      if (window.ethereum) {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }
    };

    checkConnectedWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts.length > 0 ? accounts[0] : null);
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 sm:mb-0">
            Cross-Chain Bridge
          </h1>
          {address ? (
            <Button
              onClick={disconnectWallet}
              disabled={isConnecting}
              variant="destructive"
            >
              Disconnect Wallet
            </Button>
          ) : (
            <Button onClick={connectWallet} disabled={isConnecting}>
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {/* Asset Balance & Transfer Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <AssetBalance address={address} />
            </div>
            <div className="md:col-span-1">
              <TransferForm />
            </div>
          </div>

          {/* Transaction History */}
          <div className="w-full">
            <TransactionHistory address={address} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs sm:text-sm text-gray-400">
          <p>Cross-Chain Bridge v1.0 @ Developed by Team Airavata</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
