import { useWallet } from "../hooks/useWallet";

export default function WalletStatus() {
  const { wallet, getNetworkName, getNetworkColor } = useWallet();

  if (!wallet.isConnected) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        <span>No wallet connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className={getNetworkColor(wallet.chainId)}>
        {getNetworkName(wallet.chainId)}
      </span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-300">
        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
      </span>
    </div>
  );
}
