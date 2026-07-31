'use client';

import { useToast } from '@/hooks/useToast';

export default function Footer() {
  const { info } = useToast();

  const socials = [
    { name: 'Twitter', icon: '𝕏', url: '#' },
    { name: 'Discord', icon: '💬', url: '#' },
    { name: 'Blog', icon: '📝', url: '#' },
    { name: 'Docs', icon: '📚', url: '#' },
  ];

  const footerLinks = [
    {
      title: 'Marketplace',
      links: ['All Collections', 'Live Auctions', 'Recently Sold', 'Top Earners'],
    },
    {
      title: 'Resources',
      links: ['Help Center', 'API Docs', 'Gas Tracker', 'Rarity Tools'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Press Kit'],
    },
    {
      title: 'Legal',
      links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'DMCA'],
    },
  ];

  return (
    <footer className="blur-c-hIAYTY" aria-label="Site Footer">
      <div className="footer-cta-band">
        <div className="footer-cta-inner">
          <div>
            <div className="blur-c-lbxCdQ blur-c-lbxCdQ-fGjDuK-as-h2 blur-c-lbxCdQ-LYxbH-color-orange" style={{ justifyContent: 'flex-start' }}>
              Join the Future of NFT Trading
            </div>
            <p className="footer-cta-desc">
              Experience the fastest, most advanced NFT marketplace built for professional traders.
              Zero fees, maximum rewards, and the most advanced trading tools.
            </p>
          </div>
          <div className="footer-cta-btns">
            <button
              className="blur-c-hOthnB blur-c-hOthnB-ioYrmS-filled-true"
              onClick={() => info('Get Started', 'Welcome to Blur! Connect your wallet to begin.')}
            >
              Get Started Free
            </button>
            <button
              className="blur-c-hOthnB"
              onClick={() => info('Read Docs', 'Opening documentation...')}
            >
              Read Docs
            </button>
          </div>
        </div>
      </div>

      <div className="footer-links-grid">
        <div className="footer-brand">
          <a href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <svg viewBox="0 0 68 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="80">
              <path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20H5.5L12 5.5z" fill="#FF8700" />
            </svg>
          </a>
          <p style={{ color: 'var(--blur-colors-gray300)', fontSize: '14px', lineHeight: '1.6', maxWidth: '260px' }}>
            The #1 NFT marketplace for pro traders. Built by traders, for traders.
          </p>
          <div className="footer-socials-row">
            {socials.map(social => (
              <a
                key={social.name}
                href={social.url}
                onClick={(e) => {
                  e.preventDefault();
                  info(social.name, `Opening ${social.name}...`);
                }}
                className="footer-social-icon"
                aria-label={social.name}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map(col => (
          <div key={col.title} className="footer-links-col">
            <h4 className="footer-col-title">{col.title}</h4>
            <ul>
              {col.links.map(link => (
                <li key={link}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      info(link, `Opening ${link}...`);
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Blur NFT Marketplace. All rights reserved.</p>
        <p>Built for traders, by traders. Zero fees.</p>
      </div>
    </footer>
  );
}
