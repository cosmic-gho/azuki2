'use client';

import { useToast } from '@/hooks/useToast';

const TICKER_ITEMS = [
  { name: 'Azuki', price: '12.5 ETH', change: '+12%', positive: true },
  { name: 'BAYC', price: '28.4 ETH', change: '-3%', positive: false },
  { name: 'MAYC', price: '5.2 ETH', change: '+8%', positive: true },
  { name: 'Moonbirds', price: '4.1 ETH', change: '-5%', positive: false },
  { name: 'Doodles', price: '2.8 ETH', change: '+15%', positive: true },
  { name: 'CloneX', price: '3.5 ETH', change: '+22%', positive: true },
  { name: 'Pudgy', price: '8.5 ETH', change: '+25%', positive: true },
  { name: 'Milady', price: '4.2 ETH', change: '+30%', positive: true },
  { name: 'DeGods', price: '3.8 ETH', change: '+12%', positive: true },
  { name: 'CyberKongz', price: '6.2 ETH', change: '+18%', positive: true },
];

export default function Ticker() {
  const { info } = useToast();
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="ticker-wrap"
      aria-label="Live market ticker"
    >
      <div className="ticker-track">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="ticker-item"
            onClick={() => info(item.name, `${item.name} • ${item.price} • ${item.change}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
          >
            <span className="ticker-name">{item.name}</span>
            <span className="ticker-price">{item.price}</span>
            <span className={`ticker-change ${item.positive ? 'up' : 'down'}`}>
              {item.positive ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
