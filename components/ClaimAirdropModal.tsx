'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { ethers } from 'ethers';

interface ClaimAirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  chainId: number | null;
}

export default function ClaimAirdropModal({ isOpen, onClose, address, chainId }: ClaimAirdropModalProps) {
  const { success, error, info } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClaimed(false);
      setClaiming(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleClaim = async () => {
    if (!address) {
      error('No Wallet Connected', 'Please connect your wallet first');
      return;
    }

    setClaiming(true);

    try {
      // Simulate claim process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call a smart contract function
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const contract = new ethers.Contract(airdropContractAddress, abi, signer);
      // const tx = await contract.claim();
      // await tx.wait();

      setClaimed(true);
      setShowConfetti(true);
      success('Airdrop Claimed!', '500 BLUR tokens have been added to your wallet');

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err: any) {
      console.error('Claim error:', err);
      error('Claim Failed', err?.message || 'Failed to claim airdrop');
    } finally {
      setClaiming(false);
    }
  };

  const handleClose = () => {
    if (!claiming) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const networkName = chainId === 1 ? 'Ethereum Mainnet' : chainId === 5 ? 'Goerli Testnet' : chainId === 11155111 ? 'Sepolia Testnet' : `Chain #${chainId}`;

  return (
    <div
      className="claim-modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-title"
    >
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                background: ['#ff8700', '#ade25d', '#f6ae2d', '#60a5fa'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div
        className="claim-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="claim-modal-header">
          <div className="claim-modal-icon">🎁</div>
          <button
            onClick={handleClose}
            className="claim-modal-close"
            aria-label="Close"
            disabled={claiming}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="claim-modal-content">
          <h2 id="claim-title" className="claim-modal-title">
            {claimed ? 'Airdrop Claimed! 🎉' : 'Claim Your BLUR Airdrop'}
          </h2>

          <p className="claim-modal-subtitle">
            {claimed 
              ? 'Your tokens have been successfully claimed and added to your wallet.'
              : 'As a valued Blur user, you\'re eligible for an exclusive airdrop of BLUR tokens!'
            }
          </p>

          {!claimed && (
            <div className="claim-modal-details">
              <div className="claim-detail-item">
                <span className="claim-detail-label">Amount</span>
                <span className="claim-detail-value">500 BLUR</span>
              </div>
              <div className="claim-detail-item">
                <span className="claim-detail-label">Value</span>
                <span className="claim-detail-value">~$250</span>
              </div>
              <div className="claim-detail-item">
                <span className="claim-detail-label">Network</span>
                <span className="claim-detail-value">{networkName}</span>
              </div>
              <div className="claim-detail-item">
                <span className="claim-detail-label">Wallet</span>
                <span className="claim-detail-value address" title={address || ''}>
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </span>
              </div>
            </div>
          )}

          {claimed && (
            <div className="claim-success-animation">
              <div className="success-circle">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <p className="success-message">
                <strong>500 BLUR</strong> has been added to your wallet
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="claim-modal-footer">
          {!claimed ? (
            <>
              <button
                onClick={handleClaim}
                disabled={claiming || !address}
                className="claim-button claim-button-primary"
              >
                {claiming ? (
                  <>
                    <span className="claim-spinner" />
                    <span>Claiming...</span>
                  </>
                ) : !address ? (
                  'Connect Wallet First'
                ) : (
                  'Claim 500 BLUR'
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={claiming}
                className="claim-button claim-button-secondary"
              >
                Maybe Later
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="claim-button claim-button-primary"
            >
              Awesome, Thanks!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}