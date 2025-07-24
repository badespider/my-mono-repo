import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MoreHorizontal,
  ExternalLink
} from "lucide-react";

const Portfolio = () => {
  const holdings = [
    {
      symbol: "SOL",
      name: "Solana",
      quantity: 847.32,
      price: 148.67,
      value: 125984.23,
      allocation: 45.2,
      targetAllocation: 40.0,
      pnl: 15420.85,
      pnlPercent: 13.97,
      change24h: 3.47
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      quantity: 48293.45,
      price: 1.00,
      value: 48293.45,
      allocation: 17.3,
      targetAllocation: 20.0,
      pnl: -156.32,
      pnlPercent: -0.32,
      change24h: 0.01
    },
    {
      symbol: "RAY",
      name: "Raydium",
      quantity: 15847.23,
      price: 2.84,
      value: 45006.13,
      allocation: 16.1,
      targetAllocation: 15.0,
      pnl: 8934.21,
      pnlPercent: 24.76,
      change24h: 5.23
    },
    {
      symbol: "ORCA",
      name: "Orca",
      quantity: 8943.67,
      price: 4.12,
      value: 36844.32,
      allocation: 13.2,
      targetAllocation: 12.0,
      pnl: 4521.67,
      pnlPercent: 14.01,
      change24h: 2.18
    },
    {
      symbol: "MNGO",
      name: "Mango",
      quantity: 45823.11,
      price: 0.48,
      value: 21995.09,
      allocation: 7.9,
      targetAllocation: 8.0,
      pnl: -2341.45,
      pnlPercent: -9.64,
      change24h: -1.23
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getProgressColor = (current: number, target: number) => {
    const diff = Math.abs(current - target);
    if (diff <= 1) return 'bg-status-success';
    if (diff <= 3) return 'bg-status-warning';
    return 'bg-status-error';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Portfolio Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio Management</h1>
            <p className="text-muted-foreground">Detailed portfolio holdings and allocation management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Export
            </Button>
            <Button variant="agent" size="sm">
              Rebalance Portfolio
            </Button>
          </div>
        </div>

        {/* Holdings Table */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Current Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Asset</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Allocation</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">24h Change</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{holding.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{holding.symbol}</div>
                            <div className="text-sm text-muted-foreground">{holding.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className="font-medium text-foreground">{holding.quantity.toLocaleString()}</div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className="font-medium text-foreground">{formatCurrency(holding.price)}</div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className="font-medium text-foreground">{formatCurrency(holding.value)}</div>
                      </td>
                      <td className="text-center py-4 px-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-foreground">{holding.allocation.toFixed(1)}%</span>
                            <span className="text-xs text-muted-foreground">/ {holding.targetAllocation.toFixed(1)}%</span>
                          </div>
                          <div className="w-16 h-1 bg-muted rounded-full mx-auto">
                            <div 
                              className={`h-1 rounded-full ${getProgressColor(holding.allocation, holding.targetAllocation)}`}
                              style={{ width: `${Math.min(100, (holding.allocation / holding.targetAllocation) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className={`font-medium ${holding.pnl >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                          {formatCurrency(holding.pnl)}
                        </div>
                        <div className={`text-sm ${holding.pnl >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                          {formatPercent(holding.pnlPercent)}
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className={`flex items-center justify-end gap-1 ${holding.change24h >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                          {holding.change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="text-sm font-medium">{formatPercent(holding.change24h)}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(holdings.reduce((sum, h) => sum + h.value, 0))}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingUp className="h-4 w-4 text-status-success" />
                <span className="text-status-success">+2.74% today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Unrealized P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-status-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-success">
                {formatCurrency(holdings.reduce((sum, h) => sum + h.pnl, 0))}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <span className="text-status-success">
                  +{((holdings.reduce((sum, h) => sum + h.pnl, 0) / holdings.reduce((sum, h) => sum + h.value, 0)) * 100).toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rebalancing Status</CardTitle>
              <Badge variant="outline" className="text-xs">
                In Sync
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {holdings.filter(h => Math.abs(h.allocation - h.targetAllocation) <= 1).length}/{holdings.length}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Assets within target range
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;