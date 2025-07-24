import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import Card from '../ui/Card';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency } from '@org/shared';

const PortfolioSummary: React.FC = () => {
  const { portfolio } = usePortfolioStore();

  if (!portfolio) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(portfolio.totalValue),
      change: portfolio.change24h,
      icon: Wallet,
      color: 'blue',
    },
    {
      title: 'Unrealized P&L',
      value: formatCurrency(portfolio.unrealizedPnL),
      change: (portfolio.unrealizedPnL / portfolio.totalValue) * 100,
      icon: portfolio.unrealizedPnL >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.unrealizedPnL >= 0 ? 'green' : 'red',
    },
    {
      title: 'Active Positions',
      value: portfolio.activePositions.toString(),
      change: 0,
      icon: Activity,
      color: 'purple',
    },
    {
      title: '24h Performance',
      value: `${portfolio.change24h >= 0 ? '+' : ''}${portfolio.change24h.toFixed(2)}%`,
      change: portfolio.change24h,
      icon: portfolio.change24h >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.change24h >= 0 ? 'green' : 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        
        return (
          <Card key={index} hover className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-${card.color}-500`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
                {card.change !== 0 && (
                  <p className={`text-sm flex items-center mt-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {isPositive ? '+' : ''}{card.change.toFixed(2)}%
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-100`}>
                <Icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PortfolioSummary;