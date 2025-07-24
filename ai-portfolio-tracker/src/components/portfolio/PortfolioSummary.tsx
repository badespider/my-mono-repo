import React from "react";
import {
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Badge,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";
import type { Portfolio } from "../../stores/portfolioStore";

interface PortfolioSummaryProps {
  portfolio?: Portfolio;
  mb?: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  ...props
}) => {
  if (!portfolio) {
    return (
      <Card {...props}>
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Text fontSize="lg" color="gray.500">
              No portfolio data available
            </Text>
            <Text fontSize="sm" color="gray.400">
              Connect your wallet or create a portfolio to get started
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  const totalValue = portfolio.totalValue;
  const totalChange24h = portfolio.totalChange24h;
  const changePercent = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;
  const isPositive = totalChange24h >= 0;

  // Calculate additional metrics
  const totalAssets = portfolio.assets.length;
  const topPerformer = portfolio.assets.reduce((top, asset) =>
    asset.change24h > top.change24h ? asset : top,
    portfolio.assets[0] || { symbol: "N/A", change24h: 0 }
  );
  const worstPerformer = portfolio.assets.reduce((worst, asset) =>
    asset.change24h < worst.change24h ? asset : worst,
    portfolio.assets[0] || { symbol: "N/A", change24h: 0 }
  );

  return (
    <Card {...props}>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {/* Total Portfolio Value */}
          <Stat>
            <StatLabel>Total Portfolio Value</StatLabel>
            <StatNumber fontSize="2xl">
              ${totalValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={isPositive ? "increase" : "decrease"} />
              {Math.abs(changePercent).toFixed(2)}% (24h)
            </StatHelpText>
          </Stat>

          {/* 24h P/L */}
          <Stat>
            <StatLabel>24h P/L</StatLabel>
            <StatNumber
              fontSize="xl"
              color={isPositive ? "green.500" : "red.500"}
            >
              {isPositive ? "+" : ""}$
              {Math.abs(totalChange24h).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
            <StatHelpText>
              <Flex align="center" gap={1}>
                <Icon
                  as={isPositive ? HiTrendingUp : HiTrendingDown}
                  color={isPositive ? "green.500" : "red.500"}
                />
                <Text color={isPositive ? "green.500" : "red.500"}>
                  {isPositive ? "Gain" : "Loss"}
                </Text>
              </Flex>
            </StatHelpText>
          </Stat>

          {/* Assets Count */}
          <Stat>
            <StatLabel>Total Assets</StatLabel>
            <StatNumber fontSize="xl">{totalAssets}</StatNumber>
            <StatHelpText>
              <Badge colorScheme="blue" variant="subtle">
                Active Positions
              </Badge>
            </StatHelpText>
          </Stat>

          {/* Top/Worst Performers */}
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Performance
            </Text>
            <HStack justify="space-between">
              <VStack spacing={1} align="start">
                <Text fontSize="xs" color="gray.500">
                  Top Performer
                </Text>
                <HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {topPerformer.symbol}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="green.500"
                    fontWeight="semibold"
                  >
                    +{topPerformer.change24h.toFixed(2)}%
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <HStack justify="space-between">
              <VStack spacing={1} align="start">
                <Text fontSize="xs" color="gray.500">
                  Worst Performer
                </Text>
                <HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {worstPerformer.symbol}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="red.500"
                    fontWeight="semibold"
                  >
                    {worstPerformer.change24h.toFixed(2)}%
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};
