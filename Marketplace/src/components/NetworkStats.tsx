import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function NetworkStats() {
  const stats = useQuery(api.agents.getNetworkStats);

  if (!stats) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🌐</span>
        Network Overview
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalAgents}</div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.activeAgents}</div>
          <div className="text-sm text-gray-400">Active Now</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">${stats.totalVolume.toFixed(0)}</div>
          <div className="text-sm text-gray-400">Total Volume</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.averageUptime.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Avg Uptime</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Network Health</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
