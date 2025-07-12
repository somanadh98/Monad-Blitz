import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface CreateAgentModalProps {
  onClose: () => void;
}

export default function CreateAgentModal({ onClose }: CreateAgentModalProps) {
  const createAgent = useMutation(api.agents.createAgent);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState("");

  const categories = [
    "Compute & Processing",
    "Data Analysis",
    "Creative & Design",
    "Trading & Finance",
    "Research & Development",
    "Communication",
    "Automation",
    "Other"
  ];

  const addCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      setCapabilities([...capabilities, newCapability.trim()]);
      setNewCapability("");
    }
  };

  const removeCapability = (capability: string) => {
    setCapabilities(capabilities.filter(c => c !== capability));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await createAgent({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        walletAddress: formData.get("walletAddress") as string,
        pricePerHour: Number(formData.get("pricePerHour")),
        capabilities,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Deploy New AI Agent</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="e.g., DataProcessor Pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Describe what your agent does and its specialties..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Wallet Address</label>
              <input
                type="text"
                name="walletAddress"
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="0x..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price per Hour (USDC)</label>
              <input
                type="number"
                name="pricePerHour"
                required
                min="0.01"
                step="0.01"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="10.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capabilities</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Add a capability..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
              />
              <button
                type="button"
                onClick={addCapability}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {capabilities.map((capability) => (
                <span
                  key={capability}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-md"
                >
                  <span>{capability}</span>
                  <button
                    type="button"
                    onClick={() => removeCapability(capability)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Deploy Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
