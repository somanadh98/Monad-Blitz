import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { WalletState, NetworkConfig } from "../types/wallet";

// Network configurations
// const MONAD_NETWORK: NetworkConfig = {
//   chainId: '0x29A', // 666 in hex (Monad testnet)
//   chainName: 'Monad Testnet',
//   nativeCurrency: {
//     name: 'MON',
//     symbol: 'MON',
//     decimals: 18,
//   },
//   rpcUrls: ['https://testnet1.monad.xyz'],
//   blockExplorerUrls: ['https://testnet1.monad.xyz'],
// };
const MONAD_NETWORK: NetworkConfig = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad Token',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.monad.xyz'],  // ✅ Official working RPC endpoint
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};


const ETHEREUM_MAINNET: NetworkConfig = {
  chainId: '0x1',
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.infura.io/v3/'],
  blockExplorerUrls: ['https://etherscan.io'],
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    walletType: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();

    return () => {
      removeEventListeners();
    };
  }, []);

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    if (window.solana) {
      window.solana.on('accountChanged', handleSolanaAccountChanged);
    }
  };

  const removeEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

    if (window.solana) {
      window.solana.removeListener('accountChanged', handleSolanaAccountChanged);
    }
  };

  const checkWalletConnection = async () => {
    // Check MetaMask connection
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
          });

          setWallet({
            isConnected: true,
            address: accounts[0],
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            chainId: parseInt(chainId, 16),
            walletType: 'metamask',
          });
          return;
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }

    // Check Phantom connection
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          const balance = await window.solana.getBalance(response.publicKey);

          setWallet({
            isConnected: true,
            address: response.publicKey.toString(),
            balance: (balance / 1e9).toFixed(4), // Convert lamports to SOL
            chainId: null, // Solana doesn't use chainId
            walletType: 'phantom',
          });
        }
      } catch (error) {
        console.error('Error checking Phantom connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkWalletConnection();
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setWallet(prev => ({ ...prev, chainId: newChainId }));

    if (newChainId !== 666 && newChainId !== 1) {
      toast.warning("Consider switching to Monad Network or Ethereum for optimal experience");
    }
  };

  const handleSolanaAccountChanged = (publicKey: any) => {
    if (!publicKey) {
      disconnectWallet();
    } else {
      checkWalletConnection();
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        await checkWalletConnection();
        toast.success("MetaMask connected successfully!");

        // Check if user is on supported network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);

        if (currentChainId !== 666 && currentChainId !== 1) {
          toast.info("Would you like to switch to Monad Network?");
        }
      }
    } catch (error: any) {
      console.error('Error connecting MetaMask:', error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else {
        toast.error("Failed to connect MetaMask");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPhantom = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      toast.error("Phantom wallet is not installed. Please install Phantom to continue.");
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await window.solana.connect();
      if (response.publicKey) {
        await checkWalletConnection();
        toast.success("Phantom wallet connected successfully!");
      }
    } catch (error: any) {
      console.error('Error connecting Phantom:', error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else {
        toast.error("Failed to connect Phantom wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToMonadNetwork = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not available");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_NETWORK.chainId }],
      });
      toast.success("Switched to Monad Network");
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          });
          toast.success("Monad Network added and switched");
        } catch (addError) {
          console.error('Error adding Monad network:', addError);
          toast.error("Failed to add Monad Network");
        }
      } else {
        console.error('Error switching to Monad network:', switchError);
        toast.error("Failed to switch to Monad Network");
      }
    }
  };

  const switchToEthereum = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not available");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ETHEREUM_MAINNET.chainId }],
      });
      toast.success("Switched to Ethereum Mainnet");
    } catch (error) {
      console.error('Error switching to Ethereum:', error);
      toast.error("Failed to switch to Ethereum Mainnet");
    }
  };

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      walletType: null,
    });
    toast.info("Wallet disconnected");
  }, []);

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return 'Solana';

    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 666:
        return 'Monad';
      case 137:
        return 'Polygon';
      case 56:
        return 'BSC';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId: number | null) => {
    if (!chainId) return 'text-purple-400'; // Solana

    switch (chainId) {
      case 1:
        return 'text-blue-400'; // Ethereum
      case 666:
        return 'text-green-400'; // Monad
      case 137:
        return 'text-purple-400'; // Polygon
      case 56:
        return 'text-yellow-400'; // BSC
      default:
        return 'text-gray-400';
    }
  };

  return {
    wallet,
    isConnecting,
    connectMetaMask,
    connectPhantom,
    disconnectWallet,
    switchToMonadNetwork,
    switchToEthereum,
    getNetworkName,
    getNetworkColor,
  };
}
