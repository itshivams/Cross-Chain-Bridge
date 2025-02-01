import { WalletConnect } from "@/components/WalletConnect";
import { TransferForm } from "@/components/TransferForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { AssetBalance } from "@/components/AssetBalance";
import { useState } from "react";

const Index = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Cross-Chain Bridge
          </h1>
          <WalletConnect />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8">
          {/* Top Row: Balance and Transfer Form */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Asset Balance Card - Takes up 2 columns */}
            <div className="md:col-span-2">
              <AssetBalance address={connectedAddress} />
            </div>
            
            {/* Transfer Form Card - Takes up 1 column */}
            <div className="md:col-span-1">
              <TransferForm />
            </div>
          </div>

          {/* Bottom Row: Transaction History */}
          <div className="w-full">
            <TransactionHistory />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>Cross-Chain Bridge v1.0</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;