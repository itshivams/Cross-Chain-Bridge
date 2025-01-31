import React, { useContext, useState } from 'react';
import { WalletContext } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import { utils } from 'ethers';

export default function Transfer() {
  const { provider, address } = useContext(WalletContext);
  const [amount, setAmount] = useState('');

  const lockTokens = async () => {
    if (!provider) return;
    const chainAGatewayAddress = "0xYourChainAGatewayDeployed";
    const chainAGatewayABI = [
      "function lock(uint256 amount) external",
    ];

    const contract = new ethers.Contract(chainAGatewayAddress, chainAGatewayABI, provider.getSigner() as unknown as ethers.Signer);
    const tx = await contract.lock(utils.parseUnits(amount, 18));
    await tx.wait();
    alert("Locked on Chain A. Relayer will now mint on Chain B...");
  };

  return (
    <div>
      <h2>Lock Tokens on Chain A</h2>
      <input 
        type="text" 
        placeholder="Amount" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button onClick={lockTokens}>Lock</button>
    </div>
  );
}
