'use client';

import { useEffect, useState } from 'react';
import { ToastProvider } from '@/hooks/useToast';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Ticker from '@/components/Ticker';
import CollectionsSection from '@/components/CollectionsSection';
import StatsTable from '@/components/StatsTable';
import LiveAuctionsSection from '@/components/LiveAuctionsSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import ClaimAirdropModal from '@/components/ClaimAirdropModal';

function HomeInner() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [hasShownClaimForWallet, setHasShownClaimForWallet] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-show claim modal when wallet connects
  useEffect(() => {
    if (address && address !== hasShownClaimForWallet) {
      // Small delay for better UX after connection
      const timer = setTimeout(() => {
        setShowClaimModal(true);
        setHasShownClaimForWallet(address);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [address, hasShownClaimForWallet]);

  const handleWalletChange = (addr: string | null, chain: number | null) => {
    setAddress(addr);
    setChainId(chain);
    // Reset claim modal state when wallet disconnects
    if (!addr) {
      setHasShownClaimForWallet(null);
      setShowClaimModal(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="blur-c-iRGRsb blur-c-iCTXjZ">
      <Header onWalletChange={handleWalletChange} />
      <Ticker />
      <HeroSection />
      <CollectionsSection />
      <LiveAuctionsSection />
      <StatsTable />
      {address && <PortfolioDashboard address={address} chainId={chainId} />}
      <FeaturesSection />
      <Footer />

      {/* Auto-show Claim Airdrop Modal */}
      <ClaimAirdropModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        address={address}
        chainId={chainId}
      />
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeInner />
    </ToastProvider>
  );
}
