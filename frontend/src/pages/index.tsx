import React from 'react';
import WalletConnector from '../components/WalletConnector';

export default function Home() {
  return (
    <div>
      <h1>Cross-Chain Bridge Demo</h1>
      <WalletConnector />
      <p>Navigate to /transfer to do cross-chain lock & mint</p>
    </div>
  );
}
