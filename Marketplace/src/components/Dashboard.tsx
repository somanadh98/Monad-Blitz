import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import AgentCard from "./AgentCard";
import TransactionList from "./TransactionList";
import CreateAgentModal from "./CreateAgentModal";
import NetworkStats from "./NetworkStats";
import DashboardCard from "./DashboardCard";
import MarketplaceFilters from "./MarketplaceFilters";
import AnalyticsPage from "./AnalyticsPage";
import WalletConnect from "./WalletConnect";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [marketplaceFilters, setMarketplaceFilters] = useState({
    category: "",
    sortBy: "",
    searchTerm: "",
  });
  
  const myAgents = useQuery(api.agents.getMyAgents) || [];
  const allAgents = useQuery(api.agents.getAllAgents) || [];
  const transactions = useQuery(api.transactions.getMyTransactions) || [];
  const networkStats = useQuery(api.networkStats.getNetworkStats);
  const earnings = useQuery(api.earnings.getMyEarnings);
  const categories = useQuery(api.marketplace.getAgentCategories) || [];
  
  // Marketplace data with filters
  const marketplaceAgents = useQuery(api.marketplace.getMarketplaceAgents, {
    category: marketplaceFilters.category || undefined,
    sortBy: (marketplaceFilters.sortBy as "price" | "reputation" | "earnings") || undefined,
  }) || [];
  
  const searchResults = useQuery(api.marketplace.searchAgents, 
    marketplaceFilters.searchTerm ? { searchTerm: marketplaceFilters.searchTerm } : "skip"
  ) || [];

  const displayAgents = marketplaceFilters.searchTerm ? searchResults : marketplaceAgents;
  const totalEarnings = myAgents.reduce((sum, agent) => sum + agent.totalEarnings, 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "my-agents", label: "My Agents", icon: "🤖" },
    { id: "marketplace", label: "Marketplace", icon: "🏪" },
    { id: "transactions", label: "Transactions", icon: "💳" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "wallet", label: "Wallet", icon: "💼" },
  ];

  // Calculate trends
  const earningsGrowth = earnings && earnings.earningsHistory.length >= 2 ? 
    ((earnings.earnings24h - earnings.earningsHistory[earnings.earningsHistory.length - 2].earnings) / 
     (earnings.earningsHistory[earnings.earningsHistory.length - 2].earnings || 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard
              title="My Agents"
              value={myAgents.length}
              icon="🤖"
              color="blue"
            />

            <DashboardCard
              title="Total Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              icon="💰"
              color="green"
              trend={earnings ? {
                value: Math.round(earningsGrowth),
                isPositive: earningsGrowth >= 0
              } : undefined}
            />

            <DashboardCard
              title="Transactions"
              value={transactions.length}
              icon="💳"
              color="purple"
              subtitle="All time"
            />

            <DashboardCard
              title="Network Agents"
              value={networkStats?.totalAgents || 0}
              icon="🌐"
              color="orange"
              subtitle={`${networkStats?.activeAgents || 0} active`}
            />
          </div>

          <NetworkStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <TransactionList transactions={transactions.slice(0, 5)} />
              {transactions.length > 5 && (
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View all transactions →
                </button>
              )}
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Top Marketplace Agents</h3>
              <div className="space-y-3">
                {allAgents.slice(0, 3).map((agent) => (
                  <div key={agent._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{agent.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-400">{agent.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">${agent.pricePerHour}/hr</p>
                      <p className="text-xs text-gray-400">⭐ {agent.reputation.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("marketplace")}
                className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Browse marketplace →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="font-medium">Deploy New Agent</p>
                    <p className="text-sm text-blue-200">Start earning with AI</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("marketplace")}
                className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-medium">Browse Marketplace</p>
                    <p className="text-sm text-purple-200">Hire AI agents</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("analytics")}
                className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-green-200">Track performance</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("wallet")}
                className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💼</span>
                  <div>
                    <p className="font-medium">Connect Wallet</p>
                    <p className="text-sm text-orange-200">Manage payments</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Agents Tab */}
      {activeTab === "my-agents" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My AI Agents</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Deploy New Agent
            </button>
          </div>
          
          {myAgents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <DashboardCard
                title="Active Agents"
                value={myAgents.filter(a => a.status === "active").length}
                icon="✅"
                color="green"
              />
              <DashboardCard
                title="Total Earnings"
                value={`$${totalEarnings.toFixed(2)}`}
                icon="💰"
                color="green"
              />
              <DashboardCard
                title="Avg Uptime"
                value={`${myAgents.length > 0 ? (myAgents.reduce((sum, a) => sum + a.uptime, 0) / myAgents.length).toFixed(1) : 0}%`}
                icon="⏱️"
                color="blue"
              />
              <DashboardCard
                title="Avg Reputation"
                value={myAgents.length > 0 ? (myAgents.reduce((sum, a) => sum + a.reputation, 0) / myAgents.length).toFixed(1) : "0"}
                icon="⭐"
                color="yellow"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAgents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} isOwner={true} />
            ))}
          </div>
          
          {myAgents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No agents deployed yet</h3>
              <p className="text-gray-400 mb-4">Deploy your first AI agent to start earning</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Deploy Your First Agent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Agent Marketplace</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{displayAgents.length} agents available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MarketplaceFilters
                onCategoryChange={(category) => setMarketplaceFilters(prev => ({ ...prev, category }))}
                onSortChange={(sortBy) => setMarketplaceFilters(prev => ({ ...prev, sortBy }))}
                onSearchChange={(searchTerm) => setMarketplaceFilters(prev => ({ ...prev, searchTerm }))}
                categories={categories}
              />
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayAgents.map((agent) => (
                  <AgentCard key={agent._id} agent={agent} isOwner={false} />
                ))}
              </div>
              
              {displayAgents.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No agents found</h3>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Total: {transactions.length} transactions
              </div>
            </div>
          </div>
          
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <DashboardCard
                title="Total Volume"
                value={`$${transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}`}
                icon="💰"
                color="green"
              />
              <DashboardCard
                title="Confirmed"
                value={transactions.filter(tx => tx.status === "confirmed").length}
                icon="✅"
                color="green"
              />
              <DashboardCard
                title="Pending"
                value={transactions.filter(tx => tx.status === "pending").length}
                icon="⏳"
                color="yellow"
              />
            </div>
          )}
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <TransactionList transactions={transactions} />
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && <AnalyticsPage />}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Wallet Management</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletConnect />
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Supported Features</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Multi-Chain Support</p>
                    <p className="text-sm text-gray-400">Ethereum, Monad, Solana, Polygon</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Instant Payments</p>
                    <p className="text-sm text-gray-400">Real-time transaction processing</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Low Fees</p>
                    <p className="text-sm text-gray-400">Optimized gas costs</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Secure Escrow</p>
                    <p className="text-sm text-gray-400">Smart contract protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
