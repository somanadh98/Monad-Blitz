import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DashboardCard from "./DashboardCard";
import AgentPerformanceChart from "./AgentPerformanceChart";
import EarningsChart from "./EarningsChart";

export default function AnalyticsPage() {
  const analytics = useQuery(api.analytics.getAnalytics);
  const earnings = useQuery(api.earnings.getMyEarnings);

  if (!analytics || !earnings) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const earningsGrowth = earnings.earningsHistory.length >= 2 ? 
    ((earnings.earnings24h - earnings.earningsHistory[earnings.earningsHistory.length - 2].earnings) / 
     (earnings.earningsHistory[earnings.earningsHistory.length - 2].earnings || 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Earnings"
          value={`$${analytics.totalEarnings.toFixed(2)}`}
          icon="💰"
          color="green"
          trend={{
            value: Math.round(earningsGrowth),
            isPositive: earningsGrowth >= 0
          }}
          subtitle="All time"
        />
        
        <DashboardCard
          title="Avg Transaction"
          value={`$${analytics.averageTransactionValue.toFixed(2)}`}
          icon="📊"
          color="blue"
          subtitle="Per transaction"
        />
        
        <DashboardCard
          title="Total Transactions"
          value={analytics.totalTransactions}
          icon="💳"
          color="purple"
          subtitle="Completed"
        />
        
        <DashboardCard
          title="Top Agent Earnings"
          value={analytics.topPerformingAgent ? `$${analytics.topPerformingAgent.earnings.toFixed(2)}` : "$0"}
          icon="🏆"
          color="yellow"
          subtitle={analytics.topPerformingAgent?.name || "No data"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart />
        <AgentPerformanceChart />
      </div>

      {/* Monthly Trend */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Monthly Earnings Trend
        </h3>
        
        <div className="flex items-end justify-between h-40 space-x-4">
          {analytics.monthlyEarnings.map((month) => {
            const maxMonthlyEarnings = Math.max(...analytics.monthlyEarnings.map(m => m.earnings));
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-700 rounded-t flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-300"
                    style={{
                      height: maxMonthlyEarnings > 0 ? `${(month.earnings / maxMonthlyEarnings) * 100}%` : '2px'
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-xs text-blue-400 font-medium">
                  ${month.earnings.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Performance Details */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Detailed Agent Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Agent</th>
                <th className="text-left py-3 px-4">Earnings</th>
                <th className="text-left py-3 px-4">Transactions</th>
                <th className="text-left py-3 px-4">Uptime</th>
                <th className="text-left py-3 px-4">Reputation</th>
                <th className="text-left py-3 px-4">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {analytics.agentPerformance.map((agent) => (
                <tr key={agent.agentId} className="border-b border-gray-700/50">
                  <td className="py-3 px-4 font-medium">{agent.name}</td>
                  <td className="py-3 px-4 text-green-400">${agent.earnings.toFixed(2)}</td>
                  <td className="py-3 px-4">{agent.transactionCount}</td>
                  <td className="py-3 px-4">
                    <span className={`${agent.uptime > 95 ? 'text-green-400' : agent.uptime > 85 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {agent.uptime.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-yellow-400">⭐ {agent.reputation.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-400">{agent.utilizationRate.toFixed(2)}/day</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {analytics.agentPerformance.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-gray-400">No agent performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
