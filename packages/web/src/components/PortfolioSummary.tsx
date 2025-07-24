import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PortfolioSummary = () => {
  const portfolioData = {
    totalValue: 125847.32,
    change24h: 3.47,
    changeAmount: 4205.19,
    unrealizedPnL: 15420.85,
    unrealizedPercent: 13.97,
    activePositions: 8
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(portfolioData.totalValue)}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {portfolioData.change24h >= 0 ? (
              <TrendingUp className="h-4 w-4 text-status-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-status-error" />
            )}
            <span className={portfolioData.change24h >= 0 ? 'text-status-success' : 'text-status-error'}>
              {formatPercent(portfolioData.change24h)} ({formatCurrency(portfolioData.changeAmount)})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">24h change</p>
        </CardContent>
      </Card>

      {/* Unrealized P&L */}
      <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unrealized P&L
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-status-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-status-success">
            {formatCurrency(portfolioData.unrealizedPnL)}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-status-success">
              {formatPercent(portfolioData.unrealizedPercent)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Positions
          </CardTitle>
          <PieChart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {portfolioData.activePositions}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-1">
              <div className="w-3 h-3 bg-agent-monitoring rounded-full border border-background"></div>
              <div className="w-3 h-3 bg-agent-analysis rounded-full border border-background"></div>
              <div className="w-3 h-3 bg-agent-rebalancing rounded-full border border-background"></div>
              <div className="w-3 h-3 bg-status-success rounded-full border border-background"></div>
            </div>
            <span className="text-xs text-muted-foreground">Diversified</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Holdings breakdown</p>
        </CardContent>
      </Card>

      {/* 24h Performance */}
      <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            24h Performance
          </CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-status-success rounded-full animate-pulse-glow"></div>
            <span className="text-xs text-status-success">Live</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-end justify-between gap-1">
            {/* Mini chart simulation */}
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="bg-primary/30 rounded-sm flex-1 animate-fade-in"
                style={{
                  height: `${Math.random() * 60 + 10}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Intraday performance curve</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;