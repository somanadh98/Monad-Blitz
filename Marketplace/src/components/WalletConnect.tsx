import { useWallet } from "../hooks/useWallet";

export default function WalletConnect() {
  const {
    wallet,
    isConnecting,
    connectMetaMask,
    connectPhantom,
    disconnectWallet,
    switchToMonadNetwork,
    switchToEthereum,
    getNetworkName,
    getNetworkColor,
  } = useWallet();

  if (wallet.isConnected) {
    return (
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {wallet.walletType === 'metamask' ? '🦊' : '👻'}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">
                {wallet.walletType === 'metamask' ? 'MetaMask' : 'Phantom'}
              </p>
              <p className="text-xs text-gray-400">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {wallet.balance} {wallet.walletType === 'metamask' ? getNetworkName(wallet.chainId) : 'SOL'}
            </p>
            <p className={`text-xs ${getNetworkColor(wallet.chainId)}`}>
              {getNetworkName(wallet.chainId)} Network
            </p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          {wallet.walletType === 'metamask' && (
            <>
              {wallet.chainId !== 666 && (
                <button
                  onClick={switchToMonadNetwork}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Switch to Monad
                </button>
              )}
              {wallet.chainId !== 1 && (
                <button
                  onClick={switchToEthereum}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Switch to Ethereum
                </button>
              )}
            </>
          )}
          
          <button
            onClick={disconnectWallet}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-center">Connect Your Wallet</h3>
      <p className="text-gray-400 text-sm text-center mb-6">
        Connect your wallet to start using AI Agent Payment Rails
      </p>
      
      <div className="space-y-3">
        <button
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <span className="text-2xl">🦊</span>
          <span>Connect MetaMask</span>
          {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
        </button>

        <button
          onClick={connectPhantom}
          disabled={isConnecting}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <span className="text-2xl">👻</span>
          <span>Connect Phantom</span>
          {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium mb-3">Supported Networks</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Monad Network</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Ethereum</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400">Solana</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400">Polygon</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 <strong>Tip:</strong> For the best experience, use Monad Network for low fees and fast transactions.
        </p>
      </div>
    </div>
  );
}
