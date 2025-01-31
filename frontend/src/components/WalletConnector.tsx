import React, { useContext } from 'react';


declare global {
  interface Window {
    ethereum: any;
  }
}
import { WalletContext } from '../contexts/WalletContext';
import { Web3Provider } from '@ethersproject/providers';

const WalletConnector = () => {
  const { setProvider, address, setAddress } = useContext(WalletContext);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('No MetaMask found!');
      return;
    }
    const ethereum = window.ethereum;
    await ethereum.request({ method: 'eth_requestAccounts' });
    const newProvider = new Web3Provider(ethereum);
    setProvider(newProvider);

    const signer = newProvider.getSigner();
    const userAddress = await signer.getAddress();
    setAddress(userAddress);
  };

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnector;
