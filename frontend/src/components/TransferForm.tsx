import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ASSETS = [
  { id: "eth", name: "Ethereum (ETH)" },
  { id: "usdt", name: "Tether (USDT)" },
  { id: "usdc", name: "USD Coin (USDC)" },
];

type TabType = "lockMint" | "crossTransfer" | "burnUnlock";

export type TransferFormProps = {
  address: string | null;
};

export const TransferForm = ({ address }: TransferFormProps) => {
  const { toast } = useToast();

  useEffect(() => {
    console.log("TransferForm received address:", address);
  }, [address]);

  const [activeTab, setActiveTab] = useState<TabType>("crossTransfer");

  const lockMintRef = useRef<HTMLButtonElement>(null);
  const crossTransferRef = useRef<HTMLButtonElement>(null);
  const burnUnlockRef = useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateUnderline = () => {
      let ref: HTMLButtonElement | null = null;
      if (activeTab === "lockMint") ref = lockMintRef.current;
      if (activeTab === "crossTransfer") ref = crossTransferRef.current;
      if (activeTab === "burnUnlock") ref = burnUnlockRef.current;
      if (ref) {
        const { offsetLeft, clientWidth } = ref;
        setUnderlineStyle({ left: offsetLeft, width: clientWidth });
      }
    };
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeTab]);

  const signMessage = async (
    contractAddress: string,
    userAddress: string,
    action: string
  ) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not installed");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const message = `Action: ${action} | Contract: ${contractAddress} | User: ${userAddress}`;
      const signature = await signer.signMessage(message);
      return { message, signature, userAddress };
    } catch (error) {
      console.error("Signing failed:", error);
      throw error;
    }
  };


  const contractAddress = "0x1E05c0521B744bbf303bfD32071AE1B88F2d1bA6";


  const [lockMintAssetType, setLockMintAssetType] = useState("ERC-20");
  const [lockMintAsset, setLockMintAsset] = useState("");
  const [lockMintValue, setLockMintValue] = useState("");
  const [lockMintReceiver, setLockMintReceiver] = useState("");
  const [isLockMinting, setIsLockMinting] = useState(false);
  const [lockMintProgress, setLockMintProgress] = useState(0);

  const handleLockMint = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLockMinting(true);
    setLockMintProgress(20);
    try {
     
      const signedData = await signMessage(
        contractAddress,
        address,
        "LockAsset"
      );

      const data = {
        assetType: lockMintAssetType,
        asset: lockMintAsset,
        value: lockMintValue,
        receiver: lockMintReceiver,
        signature: signedData.signature,
      };

      const response = await fetch("https://server.hackiitk2.itshivam.me/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      setLockMintProgress(100);

      if (response.ok) {
        toast({
          title: result.message, 
          variant: "default",
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setLockMintProgress(100);
      console.error("Lock & Mint error:", error);
      toast({
        title: "Lock & Mint Error",
        description:
          (error as Error).message ||
          "An error occurred while processing your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsLockMinting(false);
    }
  };

  
  const [transferAssetType, setTransferAssetType] = useState("ERC-20");
  const [transferAsset, setTransferAsset] = useState("");
  const [transferSourceChain, setTransferSourceChain] = useState("");
  const [transferTargetChain, setTransferTargetChain] = useState("");
  const [transferValue, setTransferValue] = useState("");
  const [transferReceiver, setTransferReceiver] = useState("");
  const [isCrossTransferring, setIsCrossTransferring] = useState(false);
  const [crossTransferProgress, setCrossTransferProgress] = useState(0);

  const handleCrossTransfer = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsCrossTransferring(true);
    setCrossTransferProgress(20);
    try {
      const signedData = await signMessage(
        contractAddress,
        address,
        "TransferAsset"
      );

      const data = {
        assetType: transferAssetType,
        asset: transferAsset,
        sourceChain: transferSourceChain,
        targetChain: transferTargetChain,
        value: transferValue,
        receiver: transferReceiver,
        signature: signedData.signature,
      };

      const response = await fetch(
        "https://server.hackiitk2.itshivam.me/transfer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      setCrossTransferProgress(100);

      if (response.ok) {
        toast({
          title: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setCrossTransferProgress(100);
      console.error("Cross-Chain Transfer error:", error);
      toast({
        title: "Transfer Error",
        description:
          (error as Error).message ||
          "An error occurred while processing your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsCrossTransferring(false);
    }
  };

  const [burnAssetType, setBurnAssetType] = useState("ERC-20");
  const [burnAsset, setBurnAsset] = useState("");
  const [burnValue, setBurnValue] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);

  const handleBurnUnlock = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsBurning(true);
    setBurnProgress(20);
    try {
      const signedData = await signMessage(
        contractAddress,
        address,
        "UnlockAsset"
      );

      const data = {
        assetType: burnAssetType,
        asset: burnAsset,
        value: burnValue,
        signature: signedData.signature,
      };

      const response = await fetch(
        "https://server.hackiitk2.itshivam.me/unlock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      setBurnProgress(100);

      if (response.ok) {
        toast({
          title: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setBurnProgress(100);
      console.error("Unlock & Burn error:", error);
      toast({
        title: "Unlock & Burn Error",
        description:
          (error as Error).message ||
          "An error occurred while processing your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes growShrink {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-growShrink {
          animation: growShrink 0.5s ease;
        }
        @keyframes fadeInSlide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInSlide 0.5s ease-out forwards;
        }
      `}</style>

      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="px-6 pt-6">
          <div>
            <CardTitle className="text-2xl font-bold text-center">
              Cross-Chain Operations
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-300">
              Choose an operation to perform cross-chain asset transactions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-6">
          <div className="relative">
            <div className="flex justify-around mb-4">
              <button
                ref={lockMintRef}
                onClick={() => setActiveTab("lockMint")}
                className={`px-3 py-1 rounded-md transition-all duration-300 ${
                  activeTab === "lockMint"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Lock & Mint
              </button>
              <button
                ref={crossTransferRef}
                onClick={() => setActiveTab("crossTransfer")}
                className={`px-3 py-1 rounded-md transition-all duration-300 ${
                  activeTab === "crossTransfer"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Cross-Chain Transfer
              </button>
              <button
                ref={burnUnlockRef}
                onClick={() => setActiveTab("burnUnlock")}
                className={`px-3 py-1 rounded-md transition-all duration-300 ${
                  activeTab === "burnUnlock"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Unlock & Burn
              </button>
            </div>
            <span
              className="absolute bottom-0 h-1 bg-purple-500 transition-all duration-300"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
            />
          </div>
          <div className="relative min-h-[350px]">
            {activeTab === "lockMint" && (
              <div className="fade-in space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset Type
                  </label>
                  <Select
                    onValueChange={setLockMintAssetType}
                    value={lockMintAssetType}
                  >
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-gray-700">
                      <SelectItem value="ERC-20">ERC-20</SelectItem>
                      <SelectItem value="ERC-721">ERC-721</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset
                  </label>
                  <Select
                    onValueChange={setLockMintAsset}
                    value={lockMintAsset}
                  >
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset" />
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
                  <label className="block text-sm font-medium text-gray-200">
                    {lockMintAssetType === "ERC-20" ? "Amount" : "Token ID"}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      lockMintAssetType === "ERC-20"
                        ? "Enter amount"
                        : "Enter token ID"
                    }
                    value={lockMintValue}
                    onChange={(e) => setLockMintValue(e.target.value)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Receiver Address on Chain B
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter receiver address"
                    value={lockMintReceiver}
                    onChange={(e) => setLockMintReceiver(e.target.value)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                {isLockMinting && (
                  <div className="space-y-2">
                    <Progress
                      value={lockMintProgress}
                      className="w-full h-2 rounded-full overflow-hidden bg-gray-700"
                    />
                    <p className="text-sm text-center text-gray-300">
                      Processing... {lockMintProgress}%
                    </p>
                  </div>
                )}
                <Button
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all flex items-center justify-center"
                  onClick={handleLockMint}
                  disabled={
                    !lockMintAsset ||
                    !lockMintValue ||
                    !lockMintReceiver ||
                    isLockMinting
                  }
                >
                  {isLockMinting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Locking & Minting...
                    </>
                  ) : (
                    "Lock & Mint"
                  )}
                </Button>
              </div>
            )}
            {activeTab === "crossTransfer" && (
              <div className="fade-in space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset Type
                  </label>
                  <Select
                    onValueChange={setTransferAssetType}
                    value={transferAssetType}
                  >
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-gray-700">
                      <SelectItem value="ERC-20">ERC-20</SelectItem>
                      <SelectItem value="ERC-721">ERC-721</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset
                  </label>
                  <Select
                    onValueChange={setTransferAsset}
                    value={transferAsset}
                  >
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset" />
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
                  <label className="block text-sm font-medium text-gray-200">
                    Source Chain
                  </label>
                  <Select
                    onValueChange={setTransferSourceChain}
                    value={transferSourceChain}
                  >
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select source chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-gray-700">
                      <SelectItem value="amoy">Amoy Testnet</SelectItem>
                      <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Target Chain
                  </label>
                  <Select
                    onValueChange={setTransferTargetChain}
                    value={transferTargetChain}
                  >
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
                  <label className="block text-sm font-medium text-gray-200">
                    {transferAssetType === "ERC-20" ? "Amount" : "Token ID"}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      transferAssetType === "ERC-20"
                        ? "Enter amount"
                        : "Enter token ID"
                    }
                    value={transferValue}
                    onChange={(e) => setTransferValue(e.target.value)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Receiver Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter receiver address"
                    value={transferReceiver}
                    onChange={(e) => setTransferReceiver(e.target.value)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                {isCrossTransferring && (
                  <div className="space-y-2">
                    <Progress
                      value={crossTransferProgress}
                      className="w-full h-2 rounded-full overflow-hidden bg-gray-700"
                    />
                    <p className="text-sm text-center text-gray-300">
                      Processing... {crossTransferProgress}%
                    </p>
                  </div>
                )}
                <Button
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all flex items-center justify-center"
                  onClick={handleCrossTransfer}
                  disabled={
                    !transferAsset ||
                    !transferSourceChain ||
                    !transferTargetChain ||
                    !transferValue ||
                    !transferReceiver ||
                    isCrossTransferring
                  }
                >
                  {isCrossTransferring ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer Asset"
                  )}
                </Button>
              </div>
            )}
            {activeTab === "burnUnlock" && (
              <div className="fade-in space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset Type
                  </label>
                  <Select onValueChange={setBurnAssetType} value={burnAssetType}>
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-gray-700">
                      <SelectItem value="ERC-20">ERC-20</SelectItem>
                      <SelectItem value="ERC-721">ERC-721</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Asset
                  </label>
                  <Select onValueChange={setBurnAsset} value={burnAsset}>
                    <SelectTrigger className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md">
                      <SelectValue placeholder="Select asset" />
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
                  <label className="block text-sm font-medium text-gray-200">
                    {burnAssetType === "ERC-20" ? "Amount" : "Token ID"}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      burnAssetType === "ERC-20"
                        ? "Enter amount"
                        : "Enter token ID"
                    }
                    value={burnValue}
                    onChange={(e) => setBurnValue(e.target.value)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                {isBurning && (
                  <div className="space-y-2">
                    <Progress
                      value={burnProgress}
                      className="w-full h-2 rounded-full overflow-hidden bg-gray-700"
                    />
                    <p className="text-sm text-center text-gray-300">
                      Processing... {burnProgress}%
                    </p>
                  </div>
                )}
                <Button
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all flex items-center justify-center"
                  onClick={handleBurnUnlock}
                  disabled={!burnAsset || !burnValue || isBurning}
                >
                  {isBurning ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Burning & Unlocking...
                    </>
                  ) : (
                    "Burn & Unlock"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
