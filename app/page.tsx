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

function HomeInner() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="blur-c-iRGRsb blur-c-iCTXjZ">
      <Header onWalletChange={(addr, chain) => {
        setAddress(addr);
        setChainId(chain);
      }} />
      <Ticker />
      <HeroSection />
      <CollectionsSection />
      <LiveAuctionsSection />
      <StatsTable />
      {address && <PortfolioDashboard address={address} chainId={chainId} />}
      <FeaturesSection />
      <Footer />
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
