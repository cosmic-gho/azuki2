import type { Metadata } from '../types';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Blur: NFT Marketplace for Pro Traders',
  description: 'Sweep NFTs across multiple marketplaces, snipe reveals faster than others, and manage your portfolio with advanced analytics. Zero fees.',
  openGraph: {
    title: 'Fastest NFT Marketplace for Pro Traders',
    description: 'Sweep NFTs across multiple marketplaces, snipe reveals faster than others, and manage your portfolio with advanced analytics. Zero fees.',
    images: ['https://imgs.blur.io/_assets/common/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' type='image/png' sizes='16x16' href='https://blur.io/favicons/16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='https://blur.io/favicons/32.png' />
        <link rel='icon' type='image/png' sizes='48x48' href='https://blur.io/favicons/48.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='https://blur.io/favicons/180.png' />
        <script
          src='https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.16.1/dist/index.umd.js'
          async
        />
        <script
          src='/js/scripts.js'
          defer
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
