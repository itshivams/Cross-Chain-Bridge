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
import { ArrowRightLeft } from "lucide-react";
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
  const { toast } = useToast();

  const handleTransfer = async () => {
    setIsTransferring(true);
    setTransferProgress(0);
    
    try {
      // Simulate transfer progress
      for (let i = 0; i <= 100; i += 20) {
        setTransferProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
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

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle>Cross-Chain Transfer</CardTitle>
        <CardDescription>
          Transfer assets between different blockchains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Asset</label>
          <Select onValueChange={setSelectedAsset}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset to transfer" />
            </SelectTrigger>
            <SelectContent>
              {ASSETS.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Source Chain</label>
          <Select onValueChange={setSourceChain}>
            <SelectTrigger>
              <SelectValue placeholder="Select source chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amoy">Amoy Testnet</SelectItem>
              <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center py-2">
          <ArrowRightLeft className="text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Chain</label>
          <Select onValueChange={setTargetChain}>
            <SelectTrigger>
              <SelectValue placeholder="Select target chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amoy">Amoy Testnet</SelectItem>
              <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {isTransferring && (
          <div className="space-y-2">
            <Progress value={transferProgress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Transfer in progress... {transferProgress}%
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleTransfer}
          disabled={!amount || !sourceChain || !targetChain || !selectedAsset || isTransferring}
        >
          {isTransferring ? "Transferring..." : "Transfer Assets"}
        </Button>
      </CardContent>
    </Card>
  );
};