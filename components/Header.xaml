'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import WalletModal from '@/components/WalletModal';
import { ethers } from 'ethers';
import { formatAddress } from '@/lib/walletUtils';

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
  const { success, error, info, warning } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts?.[0]) {
            let providerChainId: number | null = null;
            try {
              const provider = new ethers.providers.Web3Provider(ethereum);
              const network = await provider.getNetwork();
              providerChainId = network.chainId;
            } catch { /* ignore */ }
            setAddress(accounts[0]);
            setChainId(providerChainId ?? 1);
            onWalletChange(accounts[0], providerChainId ?? 1);
          }
        }
      } catch (e) {
        console.error('Error checking connection:', e);
      }
    };
    checkConnection();

    let mounted = true;
    const handleAccountsChanged = async (accounts: string[]) => {
      if (!mounted) return;
      if (accounts?.[0]) {
        setAddress(accounts[0]);
        onWalletChange(accounts[0], chainId);
        success('Account Changed', `Switched to ${formatAddress(accounts[0])}`);
      } else {
        setAddress(null);
        setChainId(null);
        onWalletChange(null, null);
      }
    };
    const handleChainChanged = (hexId: string) => {
      if (!mounted) return;
      const newId = parseInt(hexId, 16);
      setChainId(newId);
      if (address) onWalletChange(address, newId);
      info('Network Changed', `Chain #${newId}`);
    };
    const ethereum = (window as any).ethereum;
    if (ethereum?.on) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      mounted = false;
      if (ethereum?.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onWalletChange]);

  const handleSelectWallet = async (walletName: string, provider: any) => {
    let accounts: string[] = [];
    let web3Provider: ethers.providers.Web3Provider | null = null;
    try {
      setIsConnecting(true);
      info('Connecting...', `Connecting to ${walletName}`);

      if (walletName === 'WalletConnect') {
        warning(
          'WalletConnect Setup Required',
          'To use WalletConnect, add a projectId to the provider options.'
        );
        setIsConnecting(false);
        return;
      }

      if (!provider) {
        error('Wallet Not Found', `${walletName} provider not detected.`);
        setIsConnecting(false);
        return;
      }

      try {
        accounts = await provider.request({ method: 'eth_requestAccounts' });
      } catch (reqErr: any) {
        if (reqErr?.code === -32002) {
          info('Already Requested', 'Check your wallet extension popup.');
          accounts = await provider.request({ method: 'eth_accounts' });
        } else throw reqErr;
      }

      if (!accounts?.length) throw new Error('No accounts returned');

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
        `Connected to ${walletName} (${formatAddress(signerAddress)})`
      );

      if (network.chainId !== 1) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (sw: any) {
          if (sw?.code === 4001) {
            info('Network Switch Cancelled', 'You can stay on the current network.');
          } else if (sw?.code === 4902) {
            warning('Network Not Found', 'Add Ethereum Mainnet to your wallet.');
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.code === 4001
        ? 'Connection rejected by user.'
        : (err?.message || 'Unknown error');
      error('Connection Failed', msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectClick = () => {
    setAddress(null);
    setChainId(null);
    onWalletChange(null, null);
    info('Wallet Disconnected', 'Your wallet has been disconnected');
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      success('Copied', 'Address copied to clipboard');
    } catch { /* ignore */ }
  };

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <header className='blur-c-jYbCLK'>
        <div className='blur-c-eYmsZT'>
          <div className='blur-c-hmZTzZ'>
            <a href='/' className='blur-c-dwjgSD' aria-label='Blur Home'>
              <svg viewBox='0 0 68 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12 2L2 22h20L12 2zm0 3.5L18.5 20H5.5L12 5.5z' fill='#FF8700' />
              </svg>
            </a>
            <nav className='blur-c-fUChNm blur-c-ebEYHZ' aria-label='Main navigation'>
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className='blur-c-fBNkud'>
            <div className='blur-c-yLJPJ' role='search'>
              <span className='blur-c-kdxLxW' aria-hidden='true'>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                  <path
                    d='M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
              <input
                type='text'
                placeholder='Search collections, wallets...'
                className='blur-c-cTXYex'
                aria-label='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    info('Search', `Searching for "${searchTerm || ''}"`);
                  }
                }}
              />
            </div>
          </div>

          <div className='blur-c-gzBpsk' style={{ gap: '8px' }}>
            <button
              className='mobile-menu-toggle'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label='Toggle menu'
              aria-expanded={mobileMenuOpen}
            >
              <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
              <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
              <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
            </button>

            {address ? (
              <button
                onClick={handleDisconnectClick}
                className='blur-c-hOthnB'
                style={{ gap: '8px' }}
                title='Click to disconnect • Double-click icon to copy address'
              >
                <span
                  onDoubleClick={copyAddress}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
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
                    aria-hidden='true'
                  />
                  <svg width='12' height='12' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='2' style={{ opacity: 0.8 }}>
                    <rect x='5' y='5' width='10' height='10' rx='1' />
                    <path d='M1 9V2a1 1 0 011-1h7' />
                  </svg>
                </span>
                <span className='blur-c-erCuFI'>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className='blur-c-llyHvw'>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                disabled={isConnecting}
                className='blur-c-hOthnB'
                style={{ gap: '8px' }}
              >
                {isConnecting ? (
                  <span className='spinner' aria-hidden='true' />
                ) : null}
                <span className='blur-c-erCuFI'>
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
                <span className='blur-c-llyHvw'>Connect</span>
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='mobile-menu'>
            <nav aria-label='Mobile navigation'>
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
            <div className='mobile-menu-search'>
              <div className='blur-c-yLJPJ' style={{ width: '100%' }}>
                <span className='blur-c-kdxLxW' aria-hidden='true'>
                  <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                    <path
                      d='M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <input
                  type='text'
                  placeholder='Search...'
                  className='blur-c-cTXYex'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      info('Search', `Searching for "${searchTerm}"`);
                      setMobileMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
            {!address && (
              <div style={{ padding: '12px 20px 20px' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  disabled={isConnecting}
                  className='blur-c-hOthnB blur-c-hOthnB-ioYrmS-filled-true'
                  style={{ width: '100%', gap: '0' }}
                >
                  <span className='blur-c-erCuFI'>
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </span>
                  <span className='blur-c-llyHvw'>Connect</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnecting={isConnecting}
        onSelectWallet={async (name, prov) => {
          if (typeof prov === 'string') {
            handleSelectWallet(name, null);
            return;
          }
          handleSelectWallet(name, prov);
        }}
      />
    </>
  );
}
