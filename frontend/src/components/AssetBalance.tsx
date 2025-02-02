import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

const convertToMOL = (value: string): string => {
  const mol = Number(value) / 1e18;
  return mol.toFixed(4);
};

export const AssetBalance = ({ address }: { address: string | null }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [isEthLoading, setIsEthLoading] = useState(false);

  const [amoyBalance, setAmoyBalance] = useState<string | null>(null);
  const [isAmoyLoading, setIsAmoyLoading] = useState(false);

  const { toast } = useToast();

  const fetchBalances = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected",
      });
      return;
    }

    setIsEthLoading(true);
    setIsAmoyLoading(true);

    try {
      const [ethResponse, amoyResponse] = await Promise.all([
        fetch(`https://backend-hackiitk.itshivam.me/balance?address=${address}`),
        fetch(`https://backend-hackiitk.itshivam.me/amoybalance?address=${address}`),
      ]);

      if (!ethResponse.ok) {
        throw new Error("Failed to fetch Sepolia balance");
      }
      const ethData = await ethResponse.json();
      if (!ethData.balance) {
        throw new Error("API error fetching Sepolia balance");
      }
      setBalance(ethData.balance);

      if (!amoyResponse.ok) {
        throw new Error("Failed to fetch Amoy Test balance");
      }
      const amoyData = await amoyResponse.json();
      if (amoyData.status !== "1") {
        throw new Error("API error fetching Amoy Test balance");
      }
      setAmoyBalance(convertToMOL(amoyData.result));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch balances",
      });
    } finally {
      setIsEthLoading(false);
      setIsAmoyLoading(false);
    }
  };

  const isLoading = isEthLoading || isAmoyLoading;

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105">
      <CardHeader className="mb-4">
        <CardTitle className="text-2xl font-bold text-white text-center">
          Asset Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-around items-center gap-8">
      
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Sepolia ETH Balance
            </h3>
            {isEthLoading ? (
              <Skeleton className="h-12 w-32 rounded-md" />
            ) : (
              <div className="text-3xl font-extrabold text-white transition-all">
                {balance ? `${balance} ETH` : "N/A"}
              </div>
            )}
          </div>


          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Amoy Test Balance
            </h3>
            {isAmoyLoading ? (
              <Skeleton className="h-12 w-32 rounded-md" />
            ) : (
              <div className="text-3xl font-extrabold text-white transition-all">
                {amoyBalance ? `${amoyBalance} MOL` : "N/A"}
              </div>
            )}
          </div>
        </div>

  
        <div className="mt-8 flex justify-center">
          <Button
            onClick={fetchBalances}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold rounded-full shadow-lg transition-colors duration-300"
          >
            {isLoading && (
              <FaSpinner className="animate-spin h-5 w-5 text-white" />
            )}
            {isLoading ? "Fetching..." : "View Balances"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
