'use client';

import { useToast } from '@/hooks/useToast';

export interface Collection {
  id: string;
  name: string;
  image: string;
  floor: string;
  volume: string;
  change: string;
}

export const FEATURED_COLLECTIONS: Collection[] = [
  { id: '1', name: 'Azuki', image: 'https://imgs.blur.io/_assets/homepage/collections/azuki.png', floor: '12.5 ETH', volume: '125K ETH', change: '+12%' },
  { id: '2', name: 'Bored Ape', image: 'https://imgs.blur.io/_assets/homepage/collections/bayc.png', floor: '28.4 ETH', volume: '542K ETH', change: '-3%' },
  { id: '3', name: 'Mutant Ape', image: 'https://imgs.blur.io/_assets/homepage/collections/mayc.png', floor: '5.2 ETH', volume: '285K ETH', change: '+8%' },
  { id: '4', name: 'Moonbirds', image: 'https://imgs.blur.io/_assets/homepage/collections/moonbirds.png', floor: '4.1 ETH', volume: '98K ETH', change: '-5%' },
  { id: '5', name: 'Doodles', image: 'https://imgs.blur.io/_assets/homepage/collections/doodles.png', floor: '2.8 ETH', volume: '76K ETH', change: '+15%' },
];

function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  const { info } = useToast();
  const isPositive = collection.change.startsWith('+');

  return (
    <article
      className="blur-c-cGZJhq collection-card-enhanced"
      onClick={() => info('Collection', `Viewing ${collection.name} (${collection.floor} floor)`)}
      tabIndex={0}
      role="button"
      aria-label={`${collection.name} - Floor price: ${collection.floor}`}
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
    >
      <div className="blur-c-jAEXMK">
        <div className="blur-c-bEatfl">
          <div
            className="blur-c-iQKemy"
            style={{
              backgroundImage: `url(${collection.image})`,
            }}
            aria-hidden="true"
          />
        </div>
        <div className="blur-c-fdlbLU" aria-hidden="true" />
        <div className="blur-c-kUrlCH">
          <div>
            <div className="blur-c-fbvBWC" aria-hidden="true">
              <div
                className="blur-c-iQKemy"
                style={{
                  backgroundImage: `url(${collection.image})`,
                }}
              />
            </div>
            <span className="blur-c-fYLdTV">{collection.name}</span>
          </div>
        </div>
      </div>
      <div className="collection-meta">
        <div className="collection-meta-row">
          <span>Floor</span>
          <strong>{collection.floor}</strong>
        </div>
        <div className="collection-meta-row">
          <span>Vol</span>
          <strong>{collection.volume}</strong>
        </div>
        <div className={`collection-change ${isPositive ? 'pos' : 'neg'}`}>
          {isPositive ? '▲' : '▼'} {collection.change}
        </div>
      </div>
    </article>
  );
}

export default function CollectionsSection() {
  return (
    <section id="collections" className="blur-c-chrcFE collections-section-enhanced" aria-label="Featured Collections">
      <div className="section-header">
        <h2 className="blur-c-lbxCdQ blur-c-lbxCdQ-enNLGE-as-h1 blur-c-lbxCdQ-LYxbH-color-orange" style={{ justifyContent: 'flex-start' }}>
          Featured Collections
        </h2>
        <a href="#" className="view-all-link">View All →</a>
      </div>
      <div className="blur-c-fVvoGy">
        <div className="blur-c-ejCoEP">
          <div className="blur-c-dMzNMg collections-grid-enhanced" role="list">
            {FEATURED_COLLECTIONS.map((collection, index) => (
              <div key={collection.id} role="listitem" style={{ width: '240px', flex: '0 0 auto' }}>
                <CollectionCard collection={collection} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
