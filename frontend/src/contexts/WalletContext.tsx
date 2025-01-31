import React, { createContext, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';

type WalletContextType = {
  provider: Web3Provider | null;
  setProvider: (p: Web3Provider) => void;
  address: string;
  setAddress: (addr: string) => void;
};

export const WalletContext = createContext<WalletContextType>({
  provider: null,
  setProvider: () => {},
  address: '',
  setAddress: () => {},
});

export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [address, setAddress] = useState<string>('');

  return (
    <WalletContext.Provider value={{ provider, setProvider, address, setAddress }}>
      {children}
    </WalletContext.Provider>
  );
};
