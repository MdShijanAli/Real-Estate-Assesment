import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setError(null);

    if (typeof window.ethereum === 'undefined') {
      setError('No wallet found. Please install MetaMask or another browser wallet.');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setAddress(accounts[0] || null);
      setChainId(network.chainId);
    } catch (err) {
      // 4001 = user rejected the connection request in MetaMask
      if (err.code === 4001) {
        setError('Connection request was rejected.');
      } else {
        setError(err.message || 'Failed to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return undefined;

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts.length ? accounts[0] : null);
    };
    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, chainId, isConnecting, error, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}

export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
