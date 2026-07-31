/**
 * Wallet utility functions for detecting wallets and handling mobile deep links
 */
import { ethers } from 'ethers';

// Wallet detection types
interface WalletInfo {
  name: string;
  provider: any;
  type: 'injected' | 'mobile' | 'walletconnect';
  deepLink?: string;
}

// Wallet type definitions for detection
const WALLET_TYPES = [
  { name: 'MetaMask', key: 'isMetaMask' },
  { name: 'Coinbase Wallet', key: 'isCoinbaseWallet' },
  { name: 'Trust Wallet', key: 'isTrust' },
  { name: 'Rainbow', key: 'isRainbow' },
  { name: 'Brave Wallet', key: 'isBraveWallet' },
  { name: 'Opera Wallet', key: 'isOpera' },
  { name: 'Phantom (ETH)', key: 'isPhantom' },
  { name: 'Rabby Wallet', key: 'isRabby' },
  { name: 'Frame', key: 'isFrame' },
  { name: 'Talisman', key: 'isTalisman' },
];

// Mobile wallet options
const MOBILE_WALLETS = [
  { name: 'MetaMask Mobile', type: 'mobile' as const, deepLink: 'metamask' },
  { name: 'Trust Wallet Mobile', type: 'mobile' as const, deepLink: 'trust wallet' },
  { name: 'Coinbase Wallet Mobile', type: 'mobile' as const, deepLink: 'coinbase wallet' },
  { name: 'Rainbow Mobile', type: 'mobile' as const, deepLink: 'rainbow' },
  { name: 'Phantom Mobile', type: 'mobile' as const, deepLink: 'phantom (eth)' },
];

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod',
    'blackberry', 'iemobile', 'opera mini'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
    ('ontouchstart' in window) ||
    (window.innerWidth <= 768);
}

/**
 * Create a mobile deep link for wallet connection
 */
export function createMobileDeepLink(walletName: string): string | null {
  const encodedUrl = encodeURIComponent(window.location.href);
  const links: Record<string, string> = {
    'metamask': `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`,
    'trust wallet': `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
    'coinbase wallet': `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
    'rainbow': `https://rainbow.me/dapp?url=${encodedUrl}`,
    'phantom (eth)': `https://phantom.app/ul/browse/${encodedUrl}`,
  };
  
  return links[walletName.toLowerCase()] || null;
}

/**
 * Detect available wallets in the browser
 */
export function detectWallets(): WalletInfo[] {
  if (typeof window === 'undefined') return [];
  
  const detectedWallets: WalletInfo[] = [];
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    // No injected wallet found - return mobile options if on mobile
    if (isMobileDevice()) {
      return MOBILE_WALLETS.map(wallet => ({
        name: wallet.name,
        provider: null,
        type: wallet.type,
        deepLink: createMobileDeepLink(wallet.deepLink) || undefined,
      }));
    }
    return [];
  }
  
  // Check for single provider
  WALLET_TYPES.forEach(walletType => {
    if (ethereum[walletType.key]) {
      // Handle special cases
      if (walletType.key === 'isMetaMask' && ethereum.isPhantom) {
        return; // Skip MetaMask if it's actually Phantom
      }
      
      detectedWallets.push({
        name: walletType.name,
        provider: ethereum,
        type: 'injected',
      });
    }
  });
  
  // Check for Coinbase Wallet extension
  if ((window as any).coinbaseWalletExtension) {
    const coinbaseExists = detectedWallets.some(w => w.name === 'Coinbase Wallet');
    if (!coinbaseExists) {
      detectedWallets.push({
        name: 'Coinbase Wallet',
        provider: (window as any).coinbaseWalletExtension,
        type: 'injected',
      });
    }
  }
  
  // Check for multiple providers (EIP-5749)
  if (Array.isArray(ethereum.providers)) {
    ethereum.providers.forEach((provider: any) => {
      WALLET_TYPES.forEach(walletType => {
        if (provider[walletType.key]) {
          const exists = detectedWallets.some(w => 
            w.name === walletType.name && w.provider === provider
          );
          if (!exists) {
            detectedWallets.push({
              name: walletType.name,
              provider,
              type: 'injected',
            });
          }
        }
      });
    });
  }
  
  // Add mobile wallets if on mobile or no desktop wallets found
  if (isMobileDevice() || detectedWallets.length === 0) {
    MOBILE_WALLETS.forEach(wallet => {
      const exists = detectedWallets.some(w => w.name === wallet.name);
      if (!exists) {
        detectedWallets.push({
          name: wallet.name,
          provider: null,
          type: 'mobile',
          deepLink: createMobileDeepLink(wallet.deepLink) || undefined,
        });
      }
    });
  }
  
  return detectedWallets;
}

/**
 * Get the ethers provider from window.ethereum
 */
export function getWeb3Provider(): ethers.providers.Web3Provider | null {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  
  return new ethers.providers.Web3Provider(ethereum);
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format ETH balance for display
 */
export function formatBalance(balance: string | number, decimals: number = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
}
