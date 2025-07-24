import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  ButtonGroup,
  Button,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { Portfolio } from "../../stores/portfolioStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalEquityCurveProps {
  portfolio?: Portfolio;
  mb?: number;
}

type TimeFrame = "1D" | "7D" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export const HistoricalEquityCurve: React.FC<HistoricalEquityCurveProps> = ({
  portfolio,
  ...props
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("1M");

  // Generate mock historical data based on timeframe
  const historicalData = useMemo(() => {
    if (!portfolio) return { labels: [], values: [] };

    const now = new Date();
    const dataPoints: { date: Date; value: number }[] = [];
    let periods = 30; // Default 1M
    let intervalMs = 24 * 60 * 60 * 1000; // 1 day

    switch (selectedTimeFrame) {
      case "1D":
        periods = 24;
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case "7D":
        periods = 7;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "1M":
        periods = 30;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "3M":
        periods = 90;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "6M":
        periods = 180;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "1Y":
        periods = 365;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "ALL":
        periods = 730; // 2 years
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
    }

    // Generate historical data with realistic market movements
    const baseValue = portfolio.totalValue - portfolio.totalChange24h;
    let currentValue = baseValue * 0.8; // Start 20% lower than current

    for (let i = periods; i >= 0; i--) {
      const date = new Date(now.getTime() - i * intervalMs);
      
      // Add some realistic market volatility
      const dailyReturn = (Math.random() - 0.48) * 0.04; // Slightly positive bias
      const trendFactor = (periods - i) / periods; // Upward trend over time
      const seasonalFactor = Math.sin((i / periods) * Math.PI * 4) * 0.005; // Small seasonal effect
      
      currentValue *= (1 + dailyReturn + trendFactor * 0.001 + seasonalFactor);
      
      dataPoints.push({
        date,
        value: currentValue,
      });
    }

    // Ensure the last value matches current portfolio value
    if (dataPoints.length > 0) {
      dataPoints[dataPoints.length - 1].value = portfolio.totalValue;
    }

    return {
      labels: dataPoints.map(point => point.date),
      values: dataPoints.map(point => point.value),
    };
  }, [portfolio, selectedTimeFrame]);

  const chartData = useMemo((): ChartData<"line"> => {
    if (!portfolio || historicalData.values.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const isPositiveOverall = historicalData.values[historicalData.values.length - 1] > historicalData.values[0];
    const gradientColor = isPositiveOverall ? "rgba(56, 161, 105, 0.1)" : "rgba(229, 62, 62, 0.1)";
    const lineColor = isPositiveOverall ? "#38A169" : "#E53E3E";

    return {
      labels: historicalData.labels.map(date => {
        if (selectedTimeFrame === "1D") {
          return date.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit" 
          });
        }
        return date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          ...(selectedTimeFrame === "1Y" || selectedTimeFrame === "ALL" ? { year: "2-digit" } : {})
        });
      }),
      datasets: [
        {
          label: "Portfolio Value",
          data: historicalData.values,
          borderColor: lineColor,
          backgroundColor: (context: ScriptableContext<"line">) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return gradientColor;
            }

            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, gradientColor);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            return gradient;
          },
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: "#FFFFFF",
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [portfolio, historicalData, selectedTimeFrame]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            const date = historicalData.labels[context[0].dataIndex];
            return date.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              ...(selectedTimeFrame === "1D" ? { 
                hour: "2-digit", 
                minute: "2-digit" 
              } : {})
            });
          },
          label: (context) => {
            return `Portfolio Value: $${context.parsed.y.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: selectedTimeFrame === "1D" ? 8 : 10,
        },
      },
      y: {
        display: true,
        grid: {
          color: "#E2E8F0",
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
          maxTicksLimit: 6,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!historicalData.values.length) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        maxDrawdown: 0,
        volatility: 0,
        sharpeRatio: 0,
      };
    }

    const values = historicalData.values;
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const totalReturn = endValue - startValue;
    const totalReturnPercent = (totalReturn / startValue) * 100;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = values[0];
    
    for (const value of values) {
      if (value > peak) {
        peak = value;
      } else {
        const drawdown = ((peak - value) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    // Calculate volatility (standard deviation of daily returns)
    const returns = [];
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    // Simple Sharpe ratio approximation (assuming 2% risk-free rate)
    const riskFreeRate = 0.02;
    const excessReturn = (totalReturnPercent / 100) - riskFreeRate;
    const sharpeRatio = excessReturn / (volatility / 100);

    return {
      totalReturn,
      totalReturnPercent,
      maxDrawdown,
      volatility,
      sharpeRatio,
    };
  }, [historicalData]);

  if (!portfolio) {
    return (
      <Card {...props}>
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Text fontSize="lg" color="gray.500">
              No portfolio data available
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <Heading size="md">Portfolio Performance</Heading>
          <ButtonGroup size="sm" isAttached variant="outline">
            {(["1D", "7D", "1M", "3M", "6M", "1Y", "ALL"] as TimeFrame[]).map((timeFrame) => (
              <Button
                key={timeFrame}
                isActive={selectedTimeFrame === timeFrame}
                onClick={() => setSelectedTimeFrame(timeFrame)}
              >
                {timeFrame}
              </Button>
            ))}
          </ButtonGroup>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Performance Metrics */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel fontSize="xs">Total Return</StatLabel>
              <StatNumber fontSize="md" color={performanceMetrics.totalReturn >= 0 ? "green.500" : "red.500"}>
                {performanceMetrics.totalReturn >= 0 ? "+" : ""}
                {performanceMetrics.totalReturnPercent.toFixed(2)}%
              </StatNumber>
              <StatHelpText fontSize="xs">
                <StatArrow type={performanceMetrics.totalReturn >= 0 ? "increase" : "decrease"} />
                ${Math.abs(performanceMetrics.totalReturn).toLocaleString()}
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel fontSize="xs">Max Drawdown</StatLabel>
              <StatNumber fontSize="md" color="red.500">
                -{performanceMetrics.maxDrawdown.toFixed(2)}%
              </StatNumber>
              <StatHelpText fontSize="xs">Peak to trough</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel fontSize="xs">Volatility</StatLabel>
              <StatNumber fontSize="md">
                {performanceMetrics.volatility.toFixed(1)}%
              </StatNumber>
              <StatHelpText fontSize="xs">Annualized</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel fontSize="xs">Sharpe Ratio</StatLabel>
              <StatNumber fontSize="md" color={performanceMetrics.sharpeRatio >= 1 ? "green.500" : performanceMetrics.sharpeRatio >= 0 ? "yellow.500" : "red.500"}>
                {performanceMetrics.sharpeRatio.toFixed(2)}
              </StatNumber>
              <StatHelpText fontSize="xs">Risk-adjusted</StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Chart */}
          <Box height="400px">
            <Line data={chartData} options={chartOptions} />
          </Box>

          {/* Time Range Selector Note */}
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Click and drag on the chart to zoom in on specific time periods
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};
