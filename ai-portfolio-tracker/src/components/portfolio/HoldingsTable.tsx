import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Progress,
  Tooltip,
  Link,
  Center,
} from "@chakra-ui/react";
import {
  HiDotsVertical,
  HiExternalLink,
  HiTrendingUp,
  HiTrendingDown,
  HiChevronUp,
  HiChevronDown,
  HiMinus,
} from "react-icons/hi";
import type { Portfolio, Asset } from "../../stores/portfolioStore";

interface HoldingsTableProps {
  portfolio?: Portfolio;
}

type SortField = "symbol" | "value" | "amount" | "price" | "change24h" | "allocation";
type SortDirection = "asc" | "desc";

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ portfolio }) => {
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedAssets = useMemo(() => {
    if (!portfolio?.assets) return [];

    return [...portfolio.assets].sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortField) {
        case "symbol":
          return sortDirection === "asc" 
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);
        case "value":
          aValue = a.amount * a.price;
          bValue = b.amount * b.price;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "change24h":
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case "allocation":
          aValue = (a.amount * a.price) / portfolio.totalValue * 100;
          bValue = (b.amount * b.price) / portfolio.totalValue * 100;
          break;
        default:
          aValue = a.amount * a.price;
          bValue = b.amount * b.price;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [portfolio, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <HiMinus color="gray.300" />;
    return sortDirection === "asc" ? <HiChevronUp /> : <HiChevronDown />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "green.500" : "red.500";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? HiTrendingUp : HiTrendingDown;
  };

  if (!portfolio || !portfolio.assets.length) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Holdings</Heading>
        </CardHeader>
        <CardBody>
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                No holdings found
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Add some assets to your portfolio to see them here
              </Text>
              <Button colorScheme="blue" size="sm">
                Add Asset
              </Button>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Holdings</Heading>
          <Badge colorScheme="blue" variant="subtle">
            {portfolio.assets.length} assets
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("symbol")}
                _hover={{ bg: "gray.50" }}
              >
                <HStack spacing={1}>
                  <Text>Asset</Text>
                  <Icon as={getSortIcon("symbol")} boxSize={3} />
                </HStack>
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("amount")}
                _hover={{ bg: "gray.50" }}
                isNumeric
              >
                <HStack spacing={1} justify="flex-end">
                  <Text>Holdings</Text>
                  <Icon as={getSortIcon("amount")} boxSize={3} />
                </HStack>
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("price")}
                _hover={{ bg: "gray.50" }}
                isNumeric
              >
                <HStack spacing={1} justify="flex-end">
                  <Text>Price</Text>
                  <Icon as={getSortIcon("price")} boxSize={3} />
                </HStack>
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("change24h")}
                _hover={{ bg: "gray.50" }}
                isNumeric
              >
                <HStack spacing={1} justify="flex-end">
                  <Text>24h Change</Text>
                  <Icon as={getSortIcon("change24h")} boxSize={3} />
                </HStack>
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("value")}
                _hover={{ bg: "gray.50" }}
                isNumeric
              >
                <HStack spacing={1} justify="flex-end">
                  <Text>Value</Text>
                  <Icon as={getSortIcon("value")} boxSize={3} />
                </HStack>
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort("allocation")}
                _hover={{ bg: "gray.50" }}
                isNumeric
              >
                <HStack spacing={1} justify="flex-end">
                  <Text>Allocation</Text>
                  <Icon as={getSortIcon("allocation")} boxSize={3} />
                </HStack>
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedAssets.map((asset) => {
              const value = asset.amount * asset.price;
              const allocation = (value / portfolio.totalValue) * 100;
              const isPositiveChange = asset.change24h >= 0;

              return (
                <Tr key={asset.id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <HStack spacing={3}>
                      <Avatar 
                        size="sm" 
                        name={asset.symbol}
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${asset.symbol.toLowerCase()}.png`}
                      />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="semibold" fontSize="sm">
                          {asset.symbol}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {asset.name}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  
                  <Td isNumeric>
                    <VStack spacing={0} align="end">
                      <Text fontWeight="medium" fontSize="sm">
                        {formatNumber(asset.amount, 4)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {asset.symbol}
                      </Text>
                    </VStack>
                  </Td>

                  <Td isNumeric>
                    <Text fontWeight="medium" fontSize="sm">
                      {formatCurrency(asset.price)}
                    </Text>
                  </Td>

                  <Td isNumeric>
                    <HStack spacing={1} justify="flex-end">
                      <Icon 
                        as={getChangeIcon(asset.change24h)} 
                        color={getChangeColor(asset.change24h)}
                        boxSize={3}
                      />
                      <Text 
                        color={getChangeColor(asset.change24h)}
                        fontWeight="medium"
                        fontSize="sm"
                      >
                        {isPositiveChange ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </Text>
                    </HStack>
                  </Td>

                  <Td isNumeric>
                    <VStack spacing={0} align="end">
                      <Text fontWeight="semibold" fontSize="sm">
                        {formatCurrency(value)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ${formatNumber(value / asset.amount, 4)} avg
                      </Text>
                    </VStack>
                  </Td>

                  <Td isNumeric>
                    <VStack spacing={1} align="end">
                      <Text fontWeight="medium" fontSize="sm">
                        {allocation.toFixed(1)}%
                      </Text>
                      <Progress 
                        value={allocation} 
                        size="sm" 
                        width="60px"
                        colorScheme="blue"
                      />
                    </VStack>
                  </Td>

                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rightIcon={<HiDotsVertical />}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<HiExternalLink />}
                          as={Link}
                          href={`https://solscan.io/token/${asset.symbol}`}
                          isExternal
                        >
                          View on Solscan
                        </MenuItem>
                        <MenuItem>
                          Trade
                        </MenuItem>
                        <MenuItem>
                          Set Alert
                        </MenuItem>
                        <MenuItem color="red.500">
                          Remove from Portfolio
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {/* Portfolio Summary Row */}
        <HStack 
          justify="space-between" 
          mt={6} 
          pt={4} 
          borderTop="1px solid" 
          borderColor="gray.200"
        >
          <VStack spacing={1} align="start">
            <Text fontSize="sm" fontWeight="semibold">
              Total Portfolio Value
            </Text>
            <Text fontSize="xs" color="gray.500">
              {portfolio.assets.length} assets
            </Text>
          </VStack>
          
          <VStack spacing={1} align="end">
            <Text fontSize="lg" fontWeight="bold">
              {formatCurrency(portfolio.totalValue)}
            </Text>
            <HStack spacing={1}>
              <Icon 
                as={getChangeIcon(portfolio.totalChange24h)} 
                color={getChangeColor(portfolio.totalChange24h)}
                boxSize={3}
              />
              <Text 
                color={getChangeColor(portfolio.totalChange24h)}
                fontSize="sm"
                fontWeight="medium"
              >
                {portfolio.totalChange24h >= 0 ? "+" : ""}
                {formatCurrency(portfolio.totalChange24h)} (
                {((portfolio.totalChange24h / portfolio.totalValue) * 100).toFixed(2)}%)
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};
