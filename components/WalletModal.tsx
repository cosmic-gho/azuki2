'use client';

import { useEffect } from 'react';
import { detectWallets, isMobileDevice, createMobileDeepLink } from '@/lib/walletUtils';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletName: string, provider?: any) => Promise<void>;
  isConnecting: boolean;
}

const WALLET_OPTIONS = [
  { key: 'MetaMask', name: 'MetaMask', icon: '🦊', badge: 'Popular' },
  { key: 'Coinbase Wallet', name: 'Coinbase Wallet', icon: '🟦', badge: 'Easy' },
  { key: 'Trust Wallet', name: 'Trust Wallet', icon: '🛡️', badge: 'Mobile' },
  { key: 'WalletConnect', name: 'WalletConnect', icon: '🔗', badge: 'Universal' },
  { key: 'Rainbow', name: 'Rainbow', icon: '🌈', badge: 'Fun' },
  { key: 'Phantom (ETH)', name: 'Phantom', icon: '👻', badge: 'SOL/ETH' },
];

const MOBILE_WALLETS = [
  { key: 'MetaMask Mobile', name: 'MetaMask Mobile', icon: '🦊', deepLink: 'metamask', badge: 'iOS/Android' },
  { key: 'Trust Wallet Mobile', name: 'Trust Wallet Mobile', icon: '🛡️', deepLink: 'trust wallet', badge: 'iOS/Android' },
  { key: 'Coinbase Wallet Mobile', name: 'Coinbase Wallet Mobile', icon: '🟦', deepLink: 'coinbase wallet', badge: 'iOS/Android' },
];

export default function WalletModal({
  isOpen,
  onClose,
  onSelectWallet,
  isConnecting,
}: WalletModalProps) {
  const onMobile = isMobileDevice();
  const detectedWallets = detectWallets();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWalletClick = async (walletOption: typeof WALLET_OPTIONS[0]) => {
    // For mobile deep links
    if (onMobile && walletOption.key.includes('Mobile') || walletOption.key.includes('WalletConnect')) {
      if (walletOption.key === 'WalletConnect') {
        await onSelectWallet(walletOption.name, 'walletconnect');
        return;
      }
      if ('deepLink' in walletOption) {
        const link = createMobileDeepLink((walletOption as any).deepLink);
        if (link) {
          window.open(link, '_blank');
          onClose();
          return;
        }
      }
    }

    // Find matching detected wallet
    const detected = detectedWallets.find(
      w => w.name === walletOption.name || w.name === walletOption.key
    );

    if (detected && detected.provider) {
      await onSelectWallet(detected.name, detected.provider);
    } else {
      // Fallback to default injected provider
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        await onSelectWallet(walletOption.name, ethereum);
      } else if (onMobile) {
        // Open app store if on mobile
        const walletName = walletOption.name.toLowerCase();
        if (walletName.includes('metamask')) {
          window.open('https://metamask.io/download/', '_blank');
        } else if (walletName.includes('coinbase')) {
          window.open('https://www.coinbase.com/wallet', '_blank');
        }
        onClose();
      }
    }
  };

  const displayWallets = onMobile ? MOBILE_WALLETS : WALLET_OPTIONS;

  return (
    <div
      className="wallet-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div
        className="wallet-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wallet-modal-header">
          <h2 id="wallet-modal-title" className="wallet-modal-title">
            Connect Wallet
          </h2>
          <button
            className="wallet-modal-close"
            onClick={onClose}
            disabled={isConnecting}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="2" x2="2" y2="18" />
              <line x1="2" y1="2" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: '20px', color: 'var(--blur-colors-gray300)', fontSize: '14px', lineHeight: '1.6' }}>
          {onMobile
            ? 'Choose a mobile wallet app to connect. You will be redirected to the app store if not installed.'
            : 'Choose a wallet to connect. We support all major Ethereum wallets.'}
        </div>

        <div className="wallet-list">
          {displayWallets.map((wallet) => {
            const isAvailable = detectedWallets.some(
              w => w.name === wallet.name || w.name === wallet.key
            );
            const walletAvailable = isAvailable || (window as any).ethereum;

            return (
              <button
                key={wallet.key}
                className="wallet-option"
                onClick={() => handleWalletClick(wallet)}
                disabled={isConnecting}
              >
                <div className="wallet-icon">{wallet.icon}</div>
                <div className="wallet-info">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-badge">
                    {isConnecting ? 'Connecting...' : (isAvailable || onMobile) ? wallet.badge : 'Not detected'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!onMobile && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '13px', color: 'var(--blur-colors-gray300)', marginBottom: '12px' }}>
              Don&apos;t have a wallet?
            </div>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="blur-c-hOthnB"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span style={{ marginRight: '8px' }}>🦊</span>
              Install MetaMask
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
