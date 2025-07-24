import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Badge,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import type { Portfolio } from "../../stores/portfolioStore";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PLChartsProps {
  portfolio?: Portfolio;
}

export const PLCharts: React.FC<PLChartsProps> = ({ portfolio }) => {
  const allocationData = useMemo((): ChartData<"doughnut"> => {
    if (!portfolio?.assets.length) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#E2E8F0"],
            borderWidth: 0,
          },
        ],
      };
    }

    const colors = [
      "#3182CE", // blue.500
      "#38A169", // green.500
      "#D69E2E", // yellow.500
      "#E53E3E", // red.500
      "#805AD5", // purple.500
      "#DD6B20", // orange.500
      "#319795", // teal.500
      "#C53030", // red.600
    ];

    return {
      labels: portfolio.assets.map(asset => asset.symbol),
      datasets: [
        {
          data: portfolio.assets.map(asset => asset.amount * asset.price),
          backgroundColor: colors.slice(0, portfolio.assets.length),
          borderWidth: 2,
          borderColor: "#FFFFFF",
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [portfolio]);

  const performanceData = useMemo((): ChartData<"line"> => {
    if (!portfolio?.assets.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Mock performance data over 7 days
    const days = ["7d ago", "6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "1d ago", "Now"];
    const baseValue = portfolio.totalValue - portfolio.totalChange24h;
    
    // Generate mock historical data with some volatility
    const performanceValues = days.map((_, index) => {
      const volatility = Math.random() * 0.05 - 0.025; // ±2.5% daily volatility
      const trend = (portfolio.totalChange24h / portfolio.totalValue) * (index / 7); // Linear trend
      return baseValue * (1 + trend + volatility);
    });

    return {
      labels: days,
      datasets: [
        {
          label: "Portfolio Value",
          data: performanceValues,
          borderColor: portfolio.totalChange24h >= 0 ? "#38A169" : "#E53E3E",
          backgroundColor: portfolio.totalChange24h >= 0 ? "#38A16920" : "#E53E3E20",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: portfolio.totalChange24h >= 0 ? "#38A169" : "#E53E3E",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [portfolio]);

  const allocationOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  const performanceOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            return `Value: $${context.parsed.y.toLocaleString("en-US", {
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
      },
      y: {
        display: true,
        grid: {
          color: "#E2E8F0",
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  if (!portfolio) {
    return (
      <Card>
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
    <Card>
      <CardHeader>
        <Heading size="md">Portfolio Analytics</Heading>
      </CardHeader>
      <CardBody>
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Asset Allocation</Tab>
            <Tab>Performance</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Box height="300px">
                  <Doughnut data={allocationData} options={allocationOptions} />
                </Box>
                
                {/* Allocation Summary */}
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Top Allocations
                  </Text>
                  {portfolio.assets
                    .sort((a, b) => (b.amount * b.price) - (a.amount * a.price))
                    .slice(0, 3)
                    .map((asset, index) => {
                      const value = asset.amount * asset.price;
                      const percentage = (value / portfolio.totalValue) * 100;
                      return (
                        <HStack key={asset.symbol} justify="space-between">
                          <HStack>
                            <Badge colorScheme="blue" variant="subtle">
                              #{index + 1}
                            </Badge>
                            <Text fontSize="sm" fontWeight="medium">
                              {asset.symbol}
                            </Text>
                          </HStack>
                          <VStack spacing={0} align="end">
                            <Text fontSize="sm" fontWeight="semibold">
                              {percentage.toFixed(1)}%
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ${value.toLocaleString()}
                            </Text>
                          </VStack>
                        </HStack>
                      );
                    })}
                </VStack>
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Box height="300px">
                  <Line data={performanceData} options={performanceOptions} />
                </Box>
                
                {/* Performance Summary */}
                <HStack justify="space-between">
                  <VStack spacing={1} align="start">
                    <Text fontSize="xs" color="gray.500">
                      7-Day Performance
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={portfolio.totalChange24h >= 0 ? "green.500" : "red.500"}
                    >
                      {portfolio.totalChange24h >= 0 ? "+" : ""}
                      {((portfolio.totalChange24h / portfolio.totalValue) * 100).toFixed(2)}%
                    </Text>
                  </VStack>
                  <VStack spacing={1} align="end">
                    <Text fontSize="xs" color="gray.500">
                      Current Value
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      ${portfolio.totalValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
