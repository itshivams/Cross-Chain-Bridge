import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const AssetBalance = ({ address }: { address: string | null }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchBalance = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://backend-hackiitk.itshivam.me/balance?address=${address}`);
      if (!response.ok) throw new Error("Failed to fetch balance");
      
      const data = await response.json();
      setBalance(data.balance);
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

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 p-4">
      <CardHeader>
        <CardTitle>Asset Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-12 w-32" />
        ) : (
          <div className="text-2xl font-bold">
            {balance ? `${balance} ETH` : "Click the button to view balance"}
          </div>
        )}
        <Button onClick={fetchBalance} disabled={isLoading}>
          {isLoading ? "Fetching..." : "View Balance"}
        </Button>
      </CardContent>
    </Card>
  );
};
