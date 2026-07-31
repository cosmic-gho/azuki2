'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { ethers } from 'ethers';
import EducationalConsentModal from '@/components/EducationalConsentModal';
import {
  AttackReport,
  DrainStep,
  runEducationalDrainSimulator,
} from '@/lib/educationalDrainer';

interface PortfolioDashboardProps {
  address: string;
  chainId: number | null;
}

const MOCK_STATS = [
  { label: 'Total Balance', value: '12.84 ETH', usdValue: '$42,150.32', change: '+8.2%', positive: true },
  { label: 'NFT Holdings', value: '48', usdValue: '$18,320.00', change: '+2', positive: true },
  { label: '24h Volume', value: '3.2 ETH', usdValue: '$10,480.50', change: '-15.3%', positive: false },
  { label: 'Rewards Earned', value: '512 BLUR', usdValue: '$284.16', change: '+24.1%', positive: true },
];

const MOCK_ACTIVITIES = [
  { type: 'Listed', item: 'Azuki #4281', price: '4.2 ETH', time: '2h ago', icon: '📋' },
  { type: 'Purchased', item: 'BAYC #8493', price: '28.5 ETH', time: '6h ago', icon: '🛒' },
  { type: 'Bid', item: 'Milady #1320', price: '3.8 ETH', time: '12h ago', icon: '🎯' },
  { type: 'Reward', item: 'BLUR Farming', price: '64 BLUR', time: '1d ago', icon: '🎁' },
];

export default function PortfolioDashboard({ address, chainId }: PortfolioDashboardProps) {
  const { info, warning, success, error: toastError } = useToast();

  const [showConsent, setShowConsent] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simPhase, setSimPhase] = useState('idle');
  const [steps, setSteps] = useState<DrainStep[]>([]);
  const [report, setReport] = useState<AttackReport | null>(null);
  const [optRealSignatures, setOptRealSignatures] = useState(false); // guardrail off by default

  const runRef = useRef<number>(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Scroll log to bottom when new steps arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [steps.length]);

  const getNetworkName = (id: number | null) => {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli (Testnet)',
      11155111: 'Sepolia (Testnet)',
      137: 'Polygon',
      80001: 'Mumbai',
    };
    return networks[id || 1] || `Chain #${id}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      info('Address Copied', 'Wallet address copied to clipboard');
    } catch { console.error('copy failed'); }
  };

  const handleConsentAccepted = async () => {
    setShowConsent(false);
    if (!address || !chainId) { toastError('Wallet Required', 'Connect a wallet first'); return; }
    const ethereum = (window as any).ethereum;
    if (!ethereum) { toastError('No Provider', 'Injected provider not found'); return; }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const thisRun = ++runRef.current;
    setSimRunning(true);
    setSteps([]);
    setReport(null);
    setSimProgress(0);

    try {
      await runEducationalDrainSimulator({
        provider,
        address,
        chainId,
        onProgress: (pct, phase) => {
          if (runRef.current !== thisRun) return;
          setSimProgress(pct);
          setSimPhase(phase);
        },
        onStep: (step) => {
          if (runRef.current !== thisRun) return;
          setSteps(prev => [...prev, step]);

          // Toast mirroring for the 2 critical danger phases only
          if (step.severity === 'danger' && (step.phase === 'eth-drain' || step.phase === 'erc20-drain' || step.phase === 'nft-drain')) {
            warning(
              step.phase.toUpperCase() + ': ' + step.title.split('] ')[1] || step.title,
              step.description.slice(0, 120)
            );
          }
        },
        onFinished: (finalReport) => {
          if (runRef.current !== thisRun) return;
          setReport(finalReport);
          const dollarTotal = finalReport.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 });
          success(
            'Simulation Complete',
            `Would have stolen ${finalReport.totalAssetsStolen} assets across ${finalReport.signaturesRequested} signatures (~$${dollarTotal})`
          );
        },
        requestRealSignatures: optRealSignatures,
        speedFactorMs: 550,
      });
    } catch (e: any) {
      console.error(e);
      toastError('Simulation Failed', e?.message || 'Unknown error');
    } finally {
      setSimRunning(false);
      setSimProgress(100);
    }
  };

  // Map severity to color tokens
  const sevColors = useMemo(() => ({
    info:   { bg: 'rgba(96,165,250,0.08)',  bd: 'rgba(96,165,250,0.25)',  fg: '#93c5fd' },
    warn:   { bg: 'rgba(246,174,45,0.08)', bd: 'rgba(246,174,45,0.25)', fg: '#fcd34d' },
    danger: { bg: 'rgba(248,113,113,0.08)', bd: 'rgba(248,113,113,0.3)', fg: '#fca5a5' },
  } as const), []);

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="portfolio-container">
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 className="blur-c-lbxCdQ blur-c-lbxCdQ-enNLGE-as-h1 blur-c-lbxCdQ-LYxbH-color-orange">
            Your Portfolio
          </h2>
          <div style={{ marginTop: '16px', fontSize: '15px', color: 'var(--blur-colors-gray300)' }}>
            Connected to{' '}
            <span style={{ color: 'var(--blur-colors-white1000)', fontFamily: 'monospace', fontWeight: 600 }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
            <button
              onClick={() => copyToClipboard(address)}
              className="copy-address-btn"
              title="Copy address"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="10" height="10" rx="1" />
                <path d="M1 9V2a1 1 0 011-1h7" />
              </svg>
              Copy
            </button>
            <span style={{ margin: '0 8px' }}>•</span>
            <span className="text-gradient">{getNetworkName(chainId)}</span>
          </div>
        </div>

        <div className="portfolio-stats">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="stat-card hover-lift">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div style={{ marginTop: '4px', fontSize: '14px', color: 'var(--blur-colors-gray300)' }}>
                {stat.usdValue}
              </div>
              <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                <span>{stat.positive ? '▲' : '▼'}</span> {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="sim-wrapper" style={{
          marginTop: '36px',
          borderRadius: '18px',
          border: '1px solid rgba(248,113,113,0.25)',
          background: 'linear-gradient(145deg, rgba(248,113,113,0.06), rgba(0,0,0,0.4))',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Warning banner */}
          <div style={{
            padding: '16px 22px',
            background: 'linear-gradient(90deg, rgba(239,68,68,0.2), rgba(249,115,22,0.08))',
            borderBottom: '1px solid rgba(248,113,113,0.2)',
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(248,113,113,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
            }}>🛡️</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ color: '#fecaca', fontWeight: 800, fontSize: '16px', letterSpacing: '0.2px' }}>
                Educational Drainer Simulator
              </div>
              <div style={{
                color: '#fca5a5', fontSize: '13px', marginTop: '4px',
                maxWidth: 720, lineHeight: '1.55',
              }}>
                Watch a 6-phase drain attack walk through your wallet, step-by-step —
                nothing is actually signed or sent. Demonstrates exactly what real phishing drainers do.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                className="consent-checkbox"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', borderRadius: '8px',
                  border: '1px solid',
                  borderColor: optRealSignatures ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.06)',
                  background: optRealSignatures ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', fontSize: '12px', color: '#fca5a5', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                title="Only enable on test wallets. Causes real wallet signature popups."
              >
                <input
                  type="checkbox"
                  checked={optRealSignatures}
                  onChange={(e) => {
                    setOptRealSignatures(e.target.checked);
                    warning(
                      e.target.checked ? '⚠️ REAL SIGNATURES ON' : 'Simulate-Only Restored',
                      e.target.checked
                        ? 'Signatures are now real. ONLY use a test wallet / testnet. Reject popups you do not understand.'
                        : 'All signatures reverted to simulate-only mode.'
                    );
                  }}
                  style={{ accentColor: '#ef4444' }}
                />
                Request actual wallet signatures (TEST ONLY)
              </label>

              <button
                className="blur-c-hOthnB"
                style={{
                  gap: '8px',
                  borderColor: '#ef444466',
                  color: '#fecaca',
                  background: 'rgba(239,68,68,0.08)',
                  padding: '10px 18px',
                }}
                disabled={simRunning}
                onClick={() => setShowConsent(true)}
              >
                {simRunning
                  ? (<>
                      <span className="spinner" />
                      <span className="blur-c-erCuFI">Simulating…</span>
                    </>)
                  : (<>
                      <span>🎯</span>
                      <span className="blur-c-erCuFI">{report ? 'Re-run Simulation' : 'Start Drainer Demo'}</span>
                    </>)}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {simRunning && (
            <div style={{
              padding: '10px 22px',
              background: 'rgba(0,0,0,0.25)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                flex: 1, height: '6px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${simProgress}%`,
                  background: 'linear-gradient(90deg, #f87171, #fb923c, #f59e0b)',
                  transition: 'width 0.35s ease',
                  boxShadow: '0 0 10px rgba(248,113,113,0.5)',
                }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fecaca', width: 40, textAlign: 'right' }}>
                {simProgress}%
              </div>
              <div style={{ fontSize: '11px', color: '#fca5a5', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {simPhase}
              </div>
            </div>
          )}

          {/* Step-by-step log */}
          <div
            ref={logRef}
            className="sim-log"
            style={{
              padding: '16px 22px',
              maxHeight: 340,
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            {steps.length === 0 && !simRunning && !report && (
              <div style={{
                padding: '14px 16px',
                color: 'var(--blur-colors-gray300)',
                fontSize: '13px',
                lineHeight: '1.6',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.015)',
              }}>
                No steps yet. Click <strong style={{ color: '#fecaca' }}>Start Drainer Demo</strong> to see a 6-phase drain attack walkthrough:
                mock Telegram notification → ERC-20 scan → NFT scan → ETH sweep → ERC-20 transfer → NFT transfers.
              </div>
            )}

            {steps.map((step) => {
              const c = sevColors[step.severity];
              return (
                <div
                  key={step.id}
                  style={{
                    borderRadius: '10px',
                    border: `1px solid ${c.bd}`,
                    background: c.bg,
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: '1.55',
                    animation: 'fadeInUp 0.25s ease-out',
                    display: 'flex', gap: '10px',
                  }}
                >
                  <span style={{
                    alignSelf: 'flex-start',
                    fontSize: '12px', fontWeight: 800,
                    color: c.fg,
                    minWidth: 28,
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}>
                    {String(step.id).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: c.fg, fontWeight: 700, marginBottom: '2px' }}>
                      {step.title}
                    </div>
                    <div style={{ color: 'var(--blur-colors-gray100)', fontSize: '12px', lineHeight: '1.6' }}>
                      {step.description}
                    </div>
                    {step.wouldHaveTransfered && (
                      <div style={{
                        marginTop: '8px', padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'inline-flex', gap: '10px',
                        fontSize: '11px', fontWeight: 700,
                        fontFamily: 'monospace',
                      }}>
                        <span style={{ color: '#fecaca' }}>💰 {step.wouldHaveTransfered.asset}</span>
                        <span style={{ color: 'var(--blur-colors-gray300)' }}>—</span>
                        <span style={{ color: '#fde68a' }}>{step.wouldHaveTransfered.amount}</span>
                        {step.wouldHaveTransfered.usdValue && (
                          <>
                            <span style={{ color: 'var(--blur-colors-gray300)' }}>=</span>
                            <span style={{ color: '#ade25d' }}>{step.wouldHaveTransfered.usdValue}</span>
                          </>
                        )}
                      </div>
                    )}
                    {step.methodCall && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: '#d1d5db',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        overflowX: 'auto',
                      }}>
                        <span style={{ color: '#9ca3af' }}>//&nbsp;signature / tx call:</span><br />
                        {step.methodCall}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attack Report Card */}
          {report && (
            <div style={{
              padding: '22px 22px 24px',
              borderTop: '1px solid rgba(248,113,113,0.2)',
              background: 'linear-gradient(180deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(248,113,113,0.15)',
                  color: '#fecaca',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  border: '1px solid rgba(248,113,113,0.3)',
                }}>📊 ATTACK REPORT</div>
                <div style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace' }}>
                  {(report.finishedAt
                    ? ((report.finishedAt - report.startedAt) / 1000).toFixed(2)
                    : 0)}s runtime · target: {report.targetReceiverAddress.slice(0, 10)}…
                </div>
              </div>

              <div className="report-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}>
                {[
                  { label: 'Total Value Lost', value: '$' + report.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }), accent: '#fca5a5', icon: '💸' },
                  { label: 'Assets Stolen', value: String(report.totalAssetsStolen), accent: '#fde68a', icon: '🎯' },
                  { label: 'ETH Swept', value: report.ethSwept, accent: '#fcd34d', icon: 'Ξ' },
                  { label: 'NFTs Stolen', value: String(report.nftsStolen), accent: '#c084fc', icon: '🖼️' },
                  { label: 'ERC-20s Stolen', value: report.tokensStolen.length ? report.tokensStolen.join(' · ') : 'None', accent: '#93c5fd', icon: '🪙' },
                  { label: 'Signatures Requested', value: String(report.signaturesRequested), accent: '#ade25d', icon: '✍️' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${item.accent}33`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px' }}>{item.icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--blur-colors-gray300)' }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '18px', fontWeight: 800,
                      color: item.accent,
                      fontFamily: 'monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={item.value}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: 'rgba(173,226,93,0.05)',
                border: '1px solid rgba(173,226,93,0.25)',
              }}>
                <div style={{ color: '#ade25d', fontWeight: 800, marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>✅</span>
                  What you learned from this demo
                </div>
                <ul style={{
                  margin: '6px 0 0', paddingLeft: '18px',
                  fontSize: '12.5px',
                  lineHeight: '1.8',
                  color: 'var(--blur-colors-gray100)',
                }}>
                  <li>Never click <strong>"Connect Wallet"</strong> on sites you don't fully trust.</li>
                  <li>A drainer only needs <strong>{report.signaturesRequested}</strong> signatures to empty your wallet.</li>
                  <li>Any <code>transfer()</code>, <code>safeTransferFrom()</code>, or <code>permit</code> signature should be inspected for the <strong>recipient</strong> address.</li>
                  <li>A legitimate marketplace will only ask for <strong>listing signatures</strong> (you pick the price and buyer conditions), not transfers.</li>
                  <li>Use a <strong>hardware wallet</strong> for assets you can't afford to lose.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Original bottom row */}
        <div className="bottom-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '32px',
        }}>
          <div className="glass-effect" style={{ borderRadius: '16px', padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blur-colors-white1000)' }}>
                Recent Activity
              </h3>
              <a href="#" style={{ fontSize: '13px', color: 'var(--blur-colors-orange200)', fontWeight: 600 }}>
                View All →
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {MOCK_ACTIVITIES.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 135, 0, 0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 135, 0, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.02)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(255, 135, 0, 0.2), rgba(255, 135, 0, 0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '14px', fontSize: '18px',
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blur-colors-white1000)' }}>
                      {activity.type}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--blur-colors-gray300)', marginTop: '2px' }}>
                      {activity.item}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blur-colors-orange200)' }}>
                      {activity.price}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--blur-colors-gray300)', marginTop: '2px' }}>
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-effect" style={{ borderRadius: '16px', padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blur-colors-white1000)' }}>
                Quick Actions
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: 'List NFT', icon: '📋', desc: 'Sell your NFTs', color: '#ff8700' },
                { name: 'Create Bid', icon: '🎯', desc: 'Place a bid', color: '#ade25d' },
                { name: 'Make Offer', icon: '💼', desc: 'Floor sweeps', color: '#f6ae2d' },
                { name: 'Bridge', icon: '🌉', desc: 'Cross chains', color: '#60a5fa' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => info(action.name, `${action.desc} feature coming soon!`)}
                  style={{
                    padding: '18px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = action.color + '66';
                    (e.currentTarget as HTMLElement).style.background = action.color + '12';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.02)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{action.icon}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--blur-colors-white1000)' }}>
                    {action.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--blur-colors-gray300)', marginTop: '4px' }}>
                    {action.desc}
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              marginTop: '24px', padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 135, 0, 0.15), rgba(255, 135, 0, 0.02))',
              border: '1px solid rgba(255, 135, 0, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎉</span>
                <span style={{ fontWeight: 700, color: 'var(--blur-colors-white1000)' }}>
                  Earn More Rewards!
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--blur-colors-gray200)', lineHeight: '1.5', margin: 0 }}>
                List your NFTs on Blur and earn 100% of creator royalties + BLUR token rewards.
              </p>
              <button
                className="blur-c-hOthnB blur-c-hOthnB-ioYrmS-filled-true"
                style={{ marginTop: '14px', width: '100%', gap: '0' }}
              >
                <span className="blur-c-erCuFI">Start Earning</span>
                <span className="blur-c-llyHvw">List Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <EducationalConsentModal
        open={showConsent}
        onAccept={handleConsentAccepted}
        onDecline={() => setShowConsent(false)}
      />
    </section>
  );
}
