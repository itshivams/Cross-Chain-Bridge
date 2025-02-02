import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ASSETS = [
  { id: "eth", name: "Ethereum (ETH)" },
  { id: "usdt", name: "Tether (USDT)" },
  { id: "usdc", name: "USD Coin (USDC)" },
];

export const TransferForm = () => {
  const [amount, setAmount] = useState("");
  const [sourceChain, setSourceChain] = useState("");
  const [targetChain, setTargetChain] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async () => {
    setIsTransferring(true);
    setTransferProgress(0);
    
    try {
      for (let i = 0; i <= 100; i += 20) {
        setTransferProgress(i);
        if (i === 80) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log("Transfer:", { amount, sourceChain, targetChain, selectedAsset });
      
      toast({
        title: "Transfer Initiated",
        description: "Your transfer has been successfully initiated.",
      });
    } finally {
      setIsTransferring(false);
      setTransferProgress(100);
    }
  };

  const handleSwapChains = () => {

    setIsSwapping(true);

    
    const temp = sourceChain;
    setSourceChain(targetChain);
    setTargetChain(temp);

    setTimeout(() => setIsSwapping(false), 500);
  };

  return (
    <>
      <style>{`
        @keyframes growShrink {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-growShrink {
          animation: growShrink 0.5s ease;
        }
      `}</style>

      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-bold text-center">Cross-Chain Transfer</CardTitle>
          <CardDescription className="text-center text-sm text-gray-300">
            Seamlessly transfer assets between blockchains
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Asset</label>
            <Select onValueChange={setSelectedAsset}>
              <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                <SelectValue placeholder="Select asset to transfer" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700">
                {ASSETS.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Source Chain</label>
            <Select onValueChange={setSourceChain}>
              <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700">
                <SelectItem value="amoy">Amoy Testnet</SelectItem>
                <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center py-2">
            <button onClick={handleSwapChains} type="button" aria-label="Swap Chains">
              <ArrowRightLeft
                className={`text-gray-400 w-6 h-6 ${isSwapping ? "animate-growShrink" : "animate-pulse"}`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Target Chain</label>
            <Select onValueChange={setTargetChain}>
              <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                <SelectValue placeholder="Select target chain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700">
                <SelectItem value="amoy">Amoy Testnet</SelectItem>
                <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>

          {isTransferring && (
            <div className="space-y-2">
              <Progress value={transferProgress} className="w-full h-2 rounded-full overflow-hidden bg-gray-700" />
              <p className="text-sm text-center text-gray-300">
                Transfer in progress... {transferProgress}%
              </p>
            </div>
          )}

          <Button
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all flex items-center justify-center"
            onClick={handleTransfer}
            disabled={!amount || !sourceChain || !targetChain || !selectedAsset || isTransferring}
          >
            {isTransferring ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Transferring...
              </>
            ) : (
              "Transfer Assets"
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};
