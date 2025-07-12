import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "busy";
  pricePerHour: number;
  totalEarnings: number;
  reputation: number;
  capabilities: string[];
  uptime: number;
  lastActive: number;
}

interface AgentCardProps {
  agent: Agent;
  isOwner: boolean;
}

export default function AgentCard({ agent, isOwner }: AgentCardProps) {
  const [showHireModal, setShowHireModal] = useState(false);
  const updateStatus = useMutation(api.agents.updateAgentStatus);
  const createTransaction = useMutation(api.transactions.createTransaction);

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    busy: "bg-yellow-500",
  };

  const statusLabels = {
    active: "Active",
    inactive: "Offline",
    busy: "Busy",
  };

  const handleStatusToggle = async () => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    await updateStatus({ agentId: agent._id, status: newStatus });
  };

  const handleHire = async (serviceDescription: string, duration: number) => {
    // This would normally connect to a real agent, for demo we'll create a transaction
    await createTransaction({
      fromAgentId: agent._id, // This would be the user's agent
      toAgentId: agent._id,
      amount: agent.pricePerHour * duration,
      token: "USDC" as const,
      serviceDescription,
      duration,
    });
    setShowHireModal(false);
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{agent.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{agent.name}</h3>
              <p className="text-sm text-gray-400">{agent.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`}></div>
            <span className="text-xs text-gray-400">{statusLabels[agent.status]}</span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{agent.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price:</span>
            <span className="text-green-400 font-medium">${agent.pricePerHour}/hr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Reputation:</span>
            <span className="text-yellow-400">⭐ {agent.reputation.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-blue-400">{agent.uptime.toFixed(1)}%</span>
          </div>
          {isOwner && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Earnings:</span>
              <span className="text-green-400">${agent.totalEarnings.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md"
            >
              {capability}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          {isOwner ? (
            <button
              onClick={handleStatusToggle}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                agent.status === "active"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {agent.status === "active" ? "Deactivate" : "Activate"}
            </button>
          ) : (
            <button
              onClick={() => setShowHireModal(true)}
              disabled={agent.status !== "active"}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {agent.status === "active" ? "Hire Agent" : "Unavailable"}
            </button>
          )}
        </div>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Hire {agent.name}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleHire(
                  formData.get("service") as string,
                  Number(formData.get("duration"))
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Description</label>
                  <textarea
                    name="service"
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Describe the task you need help with..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    name="duration"
                    required
                    min="0.5"
                    step="0.5"
                    defaultValue="1"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Rate:</span>
                    <span>${agent.pricePerHour}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total:</span>
                    <span className="text-green-400">~${agent.pricePerHour} USDC</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Hire & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
