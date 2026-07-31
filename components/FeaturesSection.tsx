'use client';

import { useToast } from '@/hooks/useToast';

export default function FeaturesSection() {
  const { info } = useToast();

  const features = [
    {
      icon: 'https://imgs.blur.io/_assets/homepage/features/sweep.png',
      title: 'Sweep Across Marketplaces',
      desc: 'Purchase NFTs from multiple marketplaces in one click with our patented sweep technology.',
      gradient: 'from-orange',
    },
    {
      icon: 'https://imgs.blur.io/_assets/homepage/features/snipe.png',
      title: 'Snipe Reveals Faster',
      desc: 'Be faster than others on reveal day with our optimized transaction system.',
      gradient: 'from-green',
    },
    {
      icon: 'https://imgs.blur.io/_assets/homepage/features/portfolio.png',
      title: 'Advanced Analytics',
      desc: 'Track your portfolio performance with real-time metrics and in-depth charts.',
      gradient: 'from-blue',
    },
    {
      icon: 'https://imgs.blur.io/_assets/homepage/features/sweep.png',
      title: 'Aggregator Bidding',
      desc: 'Place bids across all major marketplaces from one unified interface.',
      gradient: 'from-purple',
    },
  ];

  return (
    <section className="blur-c-bobArA" aria-label="Platform Features">
      <div className="section-header" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 className="blur-c-lbxCdQ blur-c-lbxCdQ-enNLGE-as-h1 blur-c-lbxCdQ-LYxbH-color-orange" style={{ justifyContent: 'flex-start' }}>
          Why Trade on Blur
        </h2>
      </div>
      <div className="blur-c-qIXZH">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`blur-c-ekjixO feature-card-gradient feature-${feature.gradient}`}
            onClick={() => info('Feature', `Learn more about ${feature.title}`)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
            style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}
          >
            <div className="blur-c-gnXlSB">
              <div className="blur-c-iPkBZz">
                <img src={feature.icon} alt={feature.title} className="blur-c-LKuBe" loading="lazy" />
              </div>
            </div>
            <h3 className="blur-c-lbxCdQ blur-c-lbxCdQ-brUeXh-as-h3 blur-c-lbxCdQ-gIRGZC-color-gray">
              {feature.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--blur-colors-gray300)',
              textAlign: 'center',
              lineHeight: '1.6',
              marginTop: '8px',
              maxWidth: '240px',
            }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
