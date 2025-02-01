import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const AssetBalance = ({ address }: { address: string | null }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !window.ethereum) return;
      
      setIsLoading(true);
      try {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const ethBalance = parseInt(balance, 16) / 1e18;
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch balance",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, toast]);

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle>Asset Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-32" />
        ) : (
          <div className="text-2xl font-bold">
            {balance ? `${balance} ETH` : "Connect wallet to view balance"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};