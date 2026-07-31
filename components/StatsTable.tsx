'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

interface Collection {
  id: string;
  name: string;
  image: string;
  floor: string;
  volume: string;
  change: string;
}

export const TRENDING_COLLECTIONS: Collection[] = [
  { id: '6', name: 'CloneX', image: 'https://imgs.blur.io/_assets/homepage/collections/clonex.png', floor: '3.5 ETH', volume: '145K ETH', change: '+22%' },
  { id: '7', name: 'CyberKongz', image: 'https://imgs.blur.io/_assets/homepage/collections/kongz.png', floor: '6.2 ETH', volume: '34K ETH', change: '+18%' },
  { id: '8', name: 'Pudgy Penguins', image: 'https://imgs.blur.io/_assets/homepage/collections/pudgy.png', floor: '8.5 ETH', volume: '67K ETH', change: '+25%' },
  { id: '9', name: 'Milady', image: 'https://imgs.blur.io/_assets/homepage/collections/milady.png', floor: '4.2 ETH', volume: '45K ETH', change: '+30%' },
  { id: '10', name: 'DeGods', image: 'https://imgs.blur.io/_assets/homepage/collections/degods.png', floor: '3.8 ETH', volume: '89K ETH', change: '+12%' },
  { id: '11', name: 'Azuki', image: 'https://imgs.blur.io/_assets/homepage/collections/azuki.png', floor: '12.5 ETH', volume: '125K ETH', change: '+12%' },
  { id: '12', name: 'Bored Ape', image: 'https://imgs.blur.io/_assets/homepage/collections/bayc.png', floor: '28.4 ETH', volume: '542K ETH', change: '-3%' },
  { id: '13', name: 'Mutant Ape', image: 'https://imgs.blur.io/_assets/homepage/collections/mayc.png', floor: '5.2 ETH', volume: '285K ETH', change: '+8%' },
];

const TIMEFRAMES = ['24h', '7d', '30d', 'All'];

export default function StatsTable() {
  const { info } = useToast();
  const [active, setActive] = useState(0);

  return (
    <section id="stats" className="blur-c-eLnBTz" aria-label="Trending Collections Table">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="blur-c-lbxCdQ blur-c-lbxCdQ-enNLGE-as-h1 blur-c-lbxCdQ-LYxbH-color-orange" style={{ justifyContent: 'flex-start', margin: 0, width: 'auto' }}>
            Trending Collections
          </h2>
          <p style={{ color: 'var(--blur-colors-gray300)', marginTop: '8px' }}>
            Top performing collections over the last 24 hours
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TIMEFRAMES.map((period, idx) => (
            <button
              key={period}
              onClick={() => {
                setActive(idx);
                info('Timeframe', `Showing data for ${period} period`);
              }}
              className={`timeframe-btn ${active === idx ? 'active' : ''}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="blur-c-jvgSEZ stats-table-wrap" style={{ marginTop: '24px' }}>
        <table className="blur-c-jdmvCX" style={{ width: '100%' }}>
          <thead>
            <tr className="blur-c-fFTorT">
              <th className="blur-c-jExtvl blur-c-jExtvl-fpsWl-sticky-true" style={{ flex: 1 }}>
                Collection
              </th>
              <th className="blur-c-jExtvl">Floor Price</th>
              <th className="blur-c-jExtvl">24h Volume</th>
              <th className="blur-c-jExtvl">24h %</th>
              <th className="blur-c-jExtvl">Action</th>
            </tr>
          </thead>
          <tbody className="blur-c-cgPtDb">
            {TRENDING_COLLECTIONS.map((collection, index) => (
              <tr key={collection.id} className="blur-c-fFTorT table-row-anim" style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}>
                <td
                  className="blur-c-iPHXcC blur-c-iPHXcC-zcPHL-sticky-true"
                  style={{ flex: 1 }}
                >
                  <div className="collection-rank-badge">{index + 1}</div>
                  <div className="blur-c-eZhRkG" style={{ marginRight: '12px' }}>
                    <img
                      src={collection.image}
                      alt={`${collection.name} logo`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="blur-c-dPizeP" style={{ fontWeight: 700 }}>
                      {collection.name}
                    </div>
                  </div>
                </td>
                <td className="blur-c-iPHXcC">
                  <span style={{ fontWeight: 600 }}>{collection.floor}</span>
                </td>
                <td className="blur-c-iPHXcC">{collection.volume}</td>
                <td
                  className={`blur-c-iPHXcC ${
                    collection.change.startsWith('+')
                      ? 'blur-c-iPHXcC-gkUhgm-variant-green'
                      : 'blur-c-iPHXcC-hwKZaK-variant-red'
                  }`}
                >
                  <span style={{ fontWeight: 700 }}>{collection.change}</span>
                </td>
                <td className="blur-c-iPHXcC">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => info('Trade', `Opening trade panel for ${collection.name}`)}
                      className="blur-c-hOthnB small-table-btn"
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => info('Sweep', `Opening sweep for ${collection.name}`)}
                      className="sweep-btn"
                      title="Sweep floor"
                    >
                      ⚡
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
