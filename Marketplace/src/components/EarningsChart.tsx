import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function EarningsChart() {
  const earnings = useQuery(api.earnings.getMyEarnings);

  if (!earnings) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...earnings.earningsHistory.map(day => day.earnings));

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">💰</span>
        7-Day Earnings Trend
      </h3>
      
      <div className="flex items-end justify-between h-32 space-x-2">
        {earnings.earningsHistory.map((day, index) => (
          <div key={day.date} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-700 rounded-t flex-1 flex items-end">
              <div
                className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300"
                style={{
                  height: maxEarnings > 0 ? `${(day.earnings / maxEarnings) * 100}%` : '2px'
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-xs text-green-400 font-medium">
              ${day.earnings.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">24h Earnings</p>
            <p className="text-lg font-semibold text-green-400">${earnings.earnings24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">This Month</p>
            <p className="text-lg font-semibold text-blue-400">${earnings.earningsThisMonth.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-lg font-semibold text-yellow-400">${earnings.pendingEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
