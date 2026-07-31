'use client';

import { useEffect, useState } from 'react';
import { ToastContextValue, useToast } from '@/hooks/useToast';
import WalletModal from '@/components/WalletModal';
import { ethers } from 'ethers';

const NAV_LINKS = [
  { label: 'Collections', href: '#collections' },
  { label: 'Auctions', href: '#auctions' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Stats', href: '#stats' },
];

interface HeaderProps {
  onWalletChange: (address: string | null, chainId: number | null) => void;
}

export default function Header({ onWalletChange }: HeaderProps) {
  const { success, error, info } = useToast();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts?.[0]) {
            setAddress(accounts[0]);
            const provider = new ethers.providers.Web3Provider(ethereum);
            const network = await provider.getNetwork();
            setChainId(network.chainId);
            onWalletChange(accounts[0], network.chainId);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkConnection();
  }, [onWalletChange]);

  const handleSelectWallet = async (walletName: string, provider: any) => {
    setIsConnecting(true);
    info('Connecting...', `Connecting to ${walletName}`);

    try {
      let web3Provider: ethers.providers.Web3Provider;
      let accounts: string[];

      if (provider === 'walletconnect') {
        info('WalletConnect', 'Opening WalletConnect modal...');
        setTimeout(() => {
          error('WalletConnect', 'Please configure WalletConnect projectId');
        }, 1500);
        setIsConnecting(false);
        return;
      }

      if (!provider || !provider.request) {
        throw new Error('Wallet not available');
      }

      accounts = await provider.request({ method: 'eth_requestAccounts' });

      if (!accounts?.[0]) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const signerAddress = await signer.getAddress();
      const network = await web3Provider.getNetwork();

      setAddress(signerAddress);
      setChainId(network.chainId);
      onWalletChange(signerAddress, network.chainId);
      setIsWalletModalOpen(false);

      success(
        'Wallet Connected',
        `Connected to ${walletName} (${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)})`
      );

      if (network.chainId !== 1) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
          setChainId(1);
          onWalletChange(signerAddress, 1);
        } catch {
          info('Network', 'You are connected to a test network');
        }
      }
    } catch (err: any) {
      console.error(err);
      error(
        'Connection Failed',
        err.message || 'Could not connect to wallet. Please try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setChainId(null);
    onWalletChange(null, null);
    info('Wallet Disconnected', 'Your wallet has been disconnected');
  };

  return (
    <>
      <header className="blur-c-jYbCLK">
        <div className="blur-c-eYmsZT">
          <div className="blur-c-hmZTzZ">
            <a href="/" className="blur-c-dwjgSD" aria-label="Blur Home">
              <svg viewBox="0 0 68 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20H5.5L12 5.5z" fill="#FF8700" />
              </svg>
            </a>
            <nav className="blur-c-fUChNm blur-c-ebEYHZ" aria-label="Main navigation">
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="blur-c-fBNkud">
            <div className="blur-c-yLJPJ" role="search">
              <span className="blur-c-kdxLxW" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search collections, wallets..."
                className="blur-c-cTXYex"
                aria-label="Search"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    info('Search', `Searching for "${(e.target as HTMLInputElement).value}"`);
                  }
                }}
              />
            </div>
          </div>

          <div className="blur-c-gzBpsk" style={{ gap: '8px' }}>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
              <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
              <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
            </button>

            {address ? (
              <button
                onClick={handleDisconnect}
                className="blur-c-hOthnB"
                style={{ gap: '8px' }}
                title="Click to disconnect"
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ade25d',
                    boxShadow: '0 0 8px #ade25d',
                    display: 'inline-block',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
                <span className="blur-c-erCuFI">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="blur-c-llyHvw">Disconnect</span>
              </button>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                disabled={isConnecting}
                className="blur-c-hOthnB"
                style={{ gap: '8px' }}
              >
                {isConnecting ? (
                  <span className="spinner" aria-hidden="true" />
                ) : null}
                <span className="blur-c-erCuFI">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
                <span className="blur-c-llyHvw">Connect</span>
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav aria-label="Mobile navigation">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mobile-menu-search">
              <div className="blur-c-yLJPJ" style={{ width: '100%' }}>
                <span className="blur-c-kdxLxW" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="blur-c-cTXYex"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        isConnecting={isConnecting}
      />
    </>
  );
}
