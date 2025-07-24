import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency } from '@org/shared';

const HoldingsTable: React.FC = () => {
  const { portfolio } = usePortfolioStore();

  if (!portfolio) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Holdings</h2>
        <button className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors">
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Asset</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">24h Change</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Allocation</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">P&L</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.map((holding) => {
              const isPositive = holding.change24h >= 0;
              const isPnLPositive = holding.unrealizedPnL >= 0;
              const allocationDiff = holding.allocation - holding.targetAllocation;
              
              return (
                <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img 
                        src={holding.logo} 
                        alt={holding.symbol}
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/32/6366f1/ffffff?text=${holding.symbol.charAt(0)}`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{holding.symbol}</p>
                        <p className="text-sm text-gray-500">{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {holding.quantity.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(holding.quantity * holding.currentPrice)}
                      </p>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(holding.currentPrice)}
                    </p>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className={`flex items-center ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      <span className="font-medium">
                        {isPositive ? '+' : ''}{holding.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{holding.allocation.toFixed(1)}%</span>
                          <span className="text-gray-500">
                            Target: {holding.targetAllocation.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                      </div>
                      {Math.abs(allocationDiff) > 2 && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          allocationDiff > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {allocationDiff > 0 ? 'Over' : 'Under'}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className={`font-medium ${
                      isPnLPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPnLPositive ? '+' : ''}{formatCurrency(holding.unrealizedPnL)}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                        Buy
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                        Sell
                      </button>
                      {Math.abs(allocationDiff) > 2 && (
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                          Rebalance
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default HoldingsTable;