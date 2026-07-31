'use client';

import { useState } from 'react';

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function EducationalConsentModal({ open, onAccept, onDecline }: ConsentModalProps) {
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [ack3, setAck3] = useState(false);

  if (!open) return null;

  const allAck = ack1 && ack2 && ack3;

  return (
    <div
      className="wallet-modal-overlay"
      onClick={onDecline}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edu-title"
    >
      <div
        className="wallet-modal consent-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: '#f87171',
          boxShadow: '0 0 60px rgba(248, 113, 113, 0.25)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(248,113,113,0.2)',
            background: 'linear-gradient(90deg, rgba(248,113,113,0.12), transparent)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(248,113,113,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
            }}
          >⚠️</div>
          <div>
            <h3
              id="edu-title"
              style={{
                color: '#fecaca', fontSize: '17px', fontWeight: 800, margin: 0,
                letterSpacing: '0.3px',
              }}
            >
              EDUCATIONAL DRAINER SIMULATOR
            </h3>
            <p style={{ color: '#fca5a5', fontSize: '12px', margin: '4px 0 0', fontWeight: 600 }}>
              This is a demonstration tool — NOT a real drainer
            </p>
          </div>
          <button
            onClick={onDecline}
            className="wallet-modal-close"
            aria-label="Close"
          >×</button>
        </div>

        <div style={{ padding: '22px 24px', maxHeight: '62vh', overflowY: 'auto' }}>
          <div style={{
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            lineHeight: '1.65',
            color: '#fecaca',
          }}>
            <strong style={{ color: '#f87171' }}>SAFETY DISCLOSURE:</strong><br />
            • No tokens or NFTs will be transferred.  All signatures shown are <em>not actually broadcast</em>.<br />
            • No seeds / private keys / mnemonics are scraped, read, or exfiltrated.<br />
            • No data is sent to any Telegram bot, server, or third-party.<br />
            • All "drain steps" are <strong>simulated</strong> to teach you how real drainer phishing kits operate.
          </div>

          <div style={{
            fontSize: '13px',
            color: 'var(--blur-colors-gray100)',
            lineHeight: '1.65',
            marginBottom: '20px',
          }}>
            <strong style={{ color: 'var(--blur-colors-white1000)' }}>What you'll see:</strong>
            The simulator walks through all 6 phases of a typical crypto drainer:
            <ol style={{ marginTop: '8px', paddingLeft: '18px' }}>
              <li>🔔 <em>(Mock)</em> Geo-located Telegram notification</li>
              <li>📜 Scans for 7 common ERC-20 tokens</li>
              <li>🖼️ <em>(Mock)</em> Enumerates wallet NFTs</li>
              <li>💸 Simulates ETH drain tx (95% of balance minus gas)</li>
              <li>🪙 Simulates ERC-20 drain signatures for each token with a balance</li>
              <li>🖼️ Simulates NFT <code>safeTransferFrom</code> calls</li>
            </ol>
            After each step, a running <strong>"Attack Report"</strong> tally shows you exactly what a real drainer would have stolen — so you learn what to watch for when connecting wallets to unknown sites.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label
              className="consent-checkbox"
              style={{
                cursor: 'pointer',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: ack1 ? 'rgba(173,226,93,0.4)' : 'rgba(255,255,255,0.06)',
                background: ack1 ? 'rgba(173,226,93,0.06)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={ack1}
                onChange={(e) => setAck1(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#ade25d' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.55', color: 'var(--blur-colors-gray100)' }}>
                I understand this is an <strong>educational demonstration</strong> and that <em>no real assets will be moved</em>.
              </span>
            </label>

            <label
              className="consent-checkbox"
              style={{
                cursor: 'pointer',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: ack2 ? 'rgba(173,226,93,0.4)' : 'rgba(255,255,255,0.06)',
                background: ack2 ? 'rgba(173,226,93,0.06)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={ack2}
                onChange={(e) => setAck2(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#ade25d' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.55', color: 'var(--blur-colors-gray100)' }}>
                I understand that any <strong>signature popups</strong> from my wallet are optional, and I will be the one choosing to reject or accept them.
              </span>
            </label>

            <label
              className="consent-checkbox"
              style={{
                cursor: 'pointer',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: ack3 ? 'rgba(173,226,93,0.4)' : 'rgba(255,255,255,0.06)',
                background: ack3 ? 'rgba(173,226,93,0.06)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={ack3}
                onChange={(e) => setAck3(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#ade25d' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.55', color: 'var(--blur-colors-gray100)' }}>
                I am using this on a <strong>test wallet or testnet</strong> and accept responsibility for any signatures I approve in my wallet extension.
              </span>
            </label>
          </div>
        </div>

        <div style={{
          padding: '18px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onDecline}
            className="blur-c-hOthnB"
            style={{ gap: '0' }}
          >
            <span className="blur-c-erCuFI">Cancel</span>
            <span className="blur-c-llyHvw">Exit</span>
          </button>
          <button
            onClick={() => {
              if (allAck) onAccept();
            }}
            disabled={!allAck}
            className="blur-c-hOthnB blur-c-hOthnB-ioYrmS-filled-true"
            style={{
              gap: '0',
              background: allAck
                ? 'linear-gradient(135deg, #ef4444, #f97316)'
                : 'rgba(255,255,255,0.06)',
              opacity: allAck ? 1 : 0.5,
              cursor: allAck ? 'pointer' : 'not-allowed',
              boxShadow: allAck ? '0 4px 16px rgba(239,68,68,0.35)' : 'none',
            }}
          >
            <span className="blur-c-erCuFI">{allAck ? 'Start Simulation' : 'Acknowledge all 3 items'}</span>
            <span className="blur-c-llyHvw">Begin Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
