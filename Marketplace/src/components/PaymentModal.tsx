import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useWallet } from "../hooks/useWallet";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  toAgent: {
    _id: Id<"agents">;
    name: string;
    pricePerHour: number;
    walletAddress: string;
  };
  fromAgentId?: Id<"agents">;
}

export default function PaymentModal({ isOpen, onClose, toAgent, fromAgentId }: PaymentModalProps) {
  const [amount, setAmount] = useState(toAgent.pricePerHour.toString());
  const [token, setToken] = useState<"USDC" | "DAI">("USDC");
  const [serviceDescription, setServiceDescription] = useState("");
  const [duration, setDuration] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

  const { wallet } = useWallet();
  const createTransaction = useMutation(api.transactions.createTransaction);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!fromAgentId) {
      toast.error("Please select a source agent");
      return;
    }

    if (!serviceDescription.trim()) {
      toast.error("Please describe the service");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate blockchain transaction
      if (wallet.walletType === 'metamask') {
        // MetaMask transaction simulation
        const txHash = await simulateEthereumTransaction();
        toast.success(`Transaction initiated: ${txHash.slice(0, 10)}...`);
      } else if (wallet.walletType === 'phantom') {
        // Phantom transaction simulation
        const signature = await simulateSolanaTransaction();
        toast.success(`Transaction initiated: ${signature.slice(0, 10)}...`);
      }

      // Create transaction in Convex
      await createTransaction({
        fromAgentId,
        toAgentId: toAgent._id,
        amount: parseFloat(amount),
        token,
        serviceDescription,
        duration: parseFloat(duration),
      });

      toast.success("Payment initiated successfully!");
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateEthereumTransaction = async (): Promise<string> => {
    if (!window.ethereum) throw new Error("MetaMask not available");

    // Simulate sending transaction
    const txParams = {
      to: toAgent.walletAddress,
      value: '0x' + (parseFloat(amount) * 1e18).toString(16),
      gas: '0x5208', // 21000 gas
    };

    // In a real implementation, you would call:
    // const txHash = await window.ethereum.request({
    //   method: 'eth_sendTransaction',
    //   params: [txParams],
    // });

    // For demo purposes, return a mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  };

  const simulateSolanaTransaction = async (): Promise<string> => {
    if (!window.solana) throw new Error("Phantom not available");

    // In a real implementation, you would create and send a Solana transaction
    // For demo purposes, return a mock signature
    return Math.random().toString(16).substr(2, 64);
  };

  const totalCost = parseFloat(amount) * parseFloat(duration);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Pay Agent</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Agent Info */}
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{toAgent.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{toAgent.name}</p>
                <p className="text-sm text-gray-400">${toAgent.pricePerHour}/hour</p>
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Payment Wallet</label>
            <div className="bg-gray-700 p-3 rounded-lg">
              {wallet.isConnected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {wallet.walletType === 'metamask' ? '🦊' : '👻'}
                    </span>
                    <span className="text-sm">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  </div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              ) : (
                <p className="text-red-400 text-sm">No wallet connected</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service Description</label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe the service you're requesting..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Token</label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value as "USDC" | "DAI")}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="USDC">USDC</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rate (per hour)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Rate:</span>
              <span className="text-sm">${amount} {token}/hour</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Duration:</span>
              <span className="text-sm">{duration} hours</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Total:</span>
              <span className="text-green-400">${totalCost.toFixed(2)} {token}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={!wallet.isConnected || isProcessing || !serviceDescription.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay ${totalCost.toFixed(2)} {token}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
