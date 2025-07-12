interface Transaction {
  _id: string;
  amount: number;
  token: "USDC" | "DAI";
  status: "pending" | "confirmed" | "failed";
  serviceDescription: string;
  _creationTime: number;
  txHash?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    failed: "bg-red-500",
  };

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    failed: "Failed",
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-xl">💳</span>
        </div>
        <p className="text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${statusColors[transaction.status]}`}></div>
              <div>
                <p className="font-medium text-white">{transaction.serviceDescription}</p>
                <p className="text-sm text-gray-400">
                  {new Date(transaction._creationTime).toLocaleDateString()} at{" "}
                  {new Date(transaction._creationTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-white">
              {transaction.amount.toFixed(2)} {transaction.token}
            </p>
            <p className="text-sm text-gray-400">{statusLabels[transaction.status]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
