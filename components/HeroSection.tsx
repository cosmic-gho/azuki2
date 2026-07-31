'use client';

import { useToast } from '@/hooks/useToast';

export default function HeroSection() {
  const { info } = useToast();

  return (
    <section className="blur-c-NKXOE blur-c-NKXOE-NuHtv-type-primary" aria-label="Hero">
      <div className="blur-c-bJEbyA">
        <div className="blur-c-ekfmDA">
          <div
            className="blur-c-hLgQme"
            style={{
              backgroundImage: 'url(https://imgs.blur.io/_assets/homepage/hero/hero-bg.jpg)',
            }}
            role="img"
            aria-label="NFT marketplace hero background"
          />
          <div className="blur-c-hVcpgX" aria-hidden="true" />
        </div>
      </div>
      <div className="blur-c-CsPMC">
        <div>
          <h1 className="blur-c-kcMHkA">
            <span className="text-gradient">The NFT Marketplace</span> for Pro Traders
          </h1>
          <p className="blur-c-jwQZIk">Zero fees. Advanced analytics. Real-time data.</p>
          <div className="blur-c-dzNXQz">
            <div className="blur-c-YBTkg">
              <div className="blur-c-kfVGXU stat-tile">
                <span className="blur-c-gaedrC">Total Volume</span>
                <div className="blur-c-iGbZYz">
                  <span className="blur-c-levRKm text-gradient">$4.2B+</span>
                </div>
              </div>
              <div className="blur-c-kfVGXU stat-tile">
                <span className="blur-c-gaedrC">NFTs Traded</span>
                <div className="blur-c-iGbZYz">
                  <span className="blur-c-levRKm">2.4M+</span>
                </div>
              </div>
              <div className="blur-c-kfVGXU stat-tile">
                <span className="blur-c-gaedrC">Active Users</span>
                <div className="blur-c-iGbZYz">
                  <span className="blur-c-levRKm">680K+</span>
                </div>
              </div>
              <div className="blur-c-kfVGXU stat-tile">
                <span className="blur-c-gaedrC">Collections</span>
                <div className="blur-c-iGbZYz">
                  <span className="blur-c-levRKm">12K+</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="blur-c-hOthnB blur-c-hOthnB-ioYrmS-filled-true"
              onClick={() => info('Explore', 'Loading featured collections...')}
            >
              <span className="blur-c-erCuFI">Explore Collections</span>
              <span className="blur-c-llyHvw">Start Trading</span>
            </button>
            <button
              className="blur-c-hOthnB"
              onClick={() => info('Rewards', 'BLUR rewards program coming up!')}
            >
              <span className="blur-c-erCuFI">View Rewards</span>
              <span className="blur-c-llyHvw">Earn BLUR</span>
            </button>
            <button
              className="blur-c-hOthnB"
              style={{ borderColor: 'rgba(173,226,93,0.5)', color: '#ade25d' }}
              onClick={() => info('Live Auctions', 'Opening live auctions panel...')}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ade25d',
                  boxShadow: '0 0 8px #ade25d',
                  display: 'inline-block',
                  animation: 'pulse 1s ease-in-out infinite',
                  marginRight: '6px',
                }}
                aria-hidden="true"
              />
              <span className="blur-c-erCuFI">Live Auctions</span>
              <span className="blur-c-llyHvw">View Bids</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
