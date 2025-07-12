import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AgentPerformanceChart() {
  const analytics = useQuery(api.analytics.getAnalytics);

  if (!analytics) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...analytics.agentPerformance.map(agent => agent.earnings));

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Agent Performance
      </h3>
      
      <div className="space-y-4">
        {analytics.agentPerformance.map((agent) => (
          <div key={agent.agentId} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">{agent.name}</span>
              <span className="text-sm text-green-400">${agent.earnings.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: maxEarnings > 0 ? `${(agent.earnings / maxEarnings) * 100}%` : '0%'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{agent.transactionCount} transactions</span>
              <span>{agent.uptime.toFixed(1)}% uptime</span>
            </div>
          </div>
        ))}
      </div>
      
      {analytics.agentPerformance.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📈</span>
          </div>
          <p className="text-gray-400">No performance data yet</p>
        </div>
      )}
    </div>
  );
}
