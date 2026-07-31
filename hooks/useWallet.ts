'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { isMobileDevice } from '@/lib/walletUtils';

interface WalletState {
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletOptions {
  walletName?: string;
  type?: 'injected' | 'walletconnect' | 'coinbase';
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === 'undefined') return;
      
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      try {
        // Check if already connected
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const address = accounts[0];
          const network = await provider.getNetwork();

          setState({
            address,
            provider,
            signer,
            chainId: network.chainId,
            isConnecting: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error checking existing connection:', err);
      }
    };

    checkExistingConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else if (accounts[0] !== state.address) {
        // Account changed, update state
        connect({});
      }
    };

    const handleChainChanged = () => {
      // Reload the page on chain change as recommended by MetaMask
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address]);

  const connect = useCallback(async (options: WalletOptions = {}) => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, error: 'Window not available' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        // Check if mobile and provide deep link
        if (isMobileDevice()) {
          const currentUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
          return;
        }
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const address = accounts[0];
      const network = await provider.getNetwork();

      // Try to switch to Ethereum mainnet if not already
      if (network.chainId !== 1) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError: any) {
          // If the chain is not added, don't fail - just continue
          console.warn('Could not switch to mainnet:', switchError);
        }
      }

      setState({
        address,
        provider,
        signer,
        chainId: network.chainId,
        isConnecting: false,
        error: null,
      });

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}

export default useWallet;
