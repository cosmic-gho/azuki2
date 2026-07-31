'use client';

import { useToast } from '@/hooks/useToast';

interface Auction {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  collection: string;
  currentBid: string;
  bidCount: number;
  endTime: string;
  rarity: string;
  rarityColor: string;
}

const LIVE_AUCTIONS: Auction[] = [
  {
    id: '1',
    name: 'Azuki #4281',
    tokenId: '#4281',
    collection: 'Azuki',
    image: 'https://imgs.blur.io/_assets/homepage/collections/azuki.png',
    currentBid: '4.2 ETH',
    bidCount: 18,
    endTime: '02:14:32',
    rarity: 'Legendary',
    rarityColor: '#f6ae2d',
  },
  {
    id: '2',
    name: 'BAYC #8493',
    tokenId: '#8493',
    collection: 'Bored Ape YC',
    image: 'https://imgs.blur.io/_assets/homepage/collections/bayc.png',
    currentBid: '28.5 ETH',
    bidCount: 24,
    endTime: '00:45:12',
    rarity: 'Gold',
    rarityColor: '#ade25d',
  },
  {
    id: '3',
    name: 'Milady #1320',
    tokenId: '#1320',
    collection: 'Milady',
    image: 'https://imgs.blur.io/_assets/homepage/collections/milady.png',
    currentBid: '3.8 ETH',
    bidCount: 9,
    endTime: '05:32:08',
    rarity: 'Rare',
    rarityColor: '#60a5fa',
  },
  {
    id: '4',
    name: 'CloneX #721',
    tokenId: '#721',
    collection: 'CloneX',
    image: 'https://imgs.blur.io/_assets/homepage/collections/clonex.png',
    currentBid: '5.1 ETH',
    bidCount: 31,
    endTime: '00:12:48',
    rarity: 'Epic',
    rarityColor: '#c084fc',
  },
];

export default function LiveAuctionsSection() {
  const { info } = useToast();

  return (
    <section id="auctions" className="live-auctions-section">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="blur-c-lbxCdQ blur-c-lbxCdQ-enNLGE-as-h1 blur-c-lbxCdQ-LYxbH-color-orange" style={{ justifyContent: 'flex-start', margin: 0 }}>
            Live Auctions
          </h2>
          <span className="live-pill">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        <a href="#" className="view-all-link">View All Auctions →</a>
      </div>

      <div className="auctions-grid">
        {LIVE_AUCTIONS.map((auction, idx) => (
          <div
            key={auction.id}
            className="auction-card"
            style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}
            onClick={() => info('Auction', `Bidding on ${auction.name} - ${auction.currentBid}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
          >
            <div className="auction-image-wrap">
              <div
                className="auction-image"
                style={{ backgroundImage: `url(${auction.image})` }}
              />
              <div className="auction-countdown">
                <span className="countdown-icon">⏱</span>
                <span className="countdown-text">{auction.endTime}</span>
              </div>
              <div
                className="auction-rarity"
                style={{ background: `${auction.rarityColor}20`, color: auction.rarityColor, borderColor: `${auction.rarityColor}50` }}
              >
                {auction.rarity}
              </div>
            </div>

            <div className="auction-info">
              <div className="auction-collection" style={{ color: 'var(--blur-colors-gray300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {auction.collection}
              </div>
              <h3 className="auction-name">{auction.name}</h3>

              <div className="auction-stats">
                <div>
                  <span className="stat-head">Current Bid</span>
                  <div className="current-bid">{auction.currentBid}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="stat-head">Bids</span>
                  <div className="bid-count">{auction.bidCount}</div>
                </div>
              </div>

              <button className="place-bid-btn">
                Place Bid
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
