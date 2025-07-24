"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Skeleton,
  Icon,
  Flex,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertTriangle,
  FiSettings,
  FiClock,
} from "react-icons/fi";
import { useAgentStore } from "../../stores/agentStore";
import { useWebSocket } from "../../services/websocket";
import type { Agent } from "../../services/types/api";
import AgentQuickActions from "./AgentQuickActions";

// Agent type to icon mapping
const AGENT_TYPE_ICONS = {
  monitoring: FiActivity,
  analysis: FiTrendingUp,
  rebalancing: FiRefreshCw,
  alerts: FiAlertTriangle,
} as const;

// Status color mapping
const STATUS_COLORS = {
  active: "green",
  inactive: "gray",
  error: "red",
  maintenance: "orange",
} as const;

// Status display names
const STATUS_LABELS = {
  active: "Connected",
  inactive: "Stopped",
  error: "Error",
  maintenance: "Maintenance",
} as const;

interface AgentCardProps {
  agent: Agent;
  onOpenControlPanel: (agentId: string) => void;
}

function AgentCard({ agent, onOpenControlPanel }: AgentCardProps) {
  const cardBg = "white";
  const borderColor = "gray.200";
  const textColor = "gray.600";

  // Calculate time since last heartbeat
  const getHeartbeatStatus = (lastExecuted?: string) => {
    if (!lastExecuted) return { text: "Never", isStale: true };

    const now = Date.now();
    const lastTime = new Date(lastExecuted).getTime();
    const diff = now - lastTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let text: string;
    let isStale = false;

    if (minutes < 1) {
      text = "Just now";
    } else if (minutes < 60) {
      text = `${minutes}m ago`;
      isStale = minutes > 5;
    } else if (hours < 24) {
      text = `${hours}h ago`;
      isStale = hours > 1;
    } else {
      text = `${days}d ago`;
      isStale = true;
    }

    return { text, isStale };
  };

  const TypeIcon = AGENT_TYPE_ICONS[agent.type];
  const heartbeat = getHeartbeatStatus(agent.lastExecuted);
  const statusColor = STATUS_COLORS[agent.status];
  const statusLabel = STATUS_LABELS[agent.status];

  // Determine if the agent is running
  const isRunning = agent.status === "active";

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      _hover={{
        transform: "translateY(-2px)",
        shadow: "lg",
        borderColor: statusColor === "green" ? "green.300" : borderColor,
      }}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
    >
      {/* Status indicator strip */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="3px"
        bg={`${statusColor}.400`}
      />

      <CardHeader pb={3}>
        <Flex justify="space-between" align="flex-start">
          <HStack spacing={3}>
            <Box
              p={2}
              bg={`${statusColor}.100`}
              color={`${statusColor}.600`}
              borderRadius="md"
            >
              <Icon as={TypeIcon} boxSize={5} />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Heading
                size="sm"
                color={
                  statusColor === "gray" ? textColor : `${statusColor}.600`
                }
              >
                {agent.name}
              </Heading>
              <Text fontSize="xs" color={textColor} textTransform="capitalize">
                {agent.type} Agent
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorScheme={statusColor}
            variant={isRunning ? "solid" : "outline"}
            fontSize="xs"
            fontWeight="medium"
          >
            {statusLabel}
          </Badge>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack align="stretch" spacing={4}>
          {/* Agent Description */}
          <Text fontSize="sm" color={textColor} noOfLines={2}>
            {agent.description || "No description available"}
          </Text>

          {/* Metrics */}
          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text fontSize="xs" color={textColor} mb={1}>
                Success Rate
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {(agent.metrics.successRate * 100).toFixed(1)}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={textColor} mb={1}>
                Executions
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {agent.metrics.executionCount.toLocaleString()}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={textColor} mb={1}>
                Avg. Time
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {agent.metrics.averageExecutionTime.toFixed(0)}ms
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={textColor} mb={1}>
                Uptime
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {(agent.metrics.uptime / 3600).toFixed(1)}h
              </Text>
            </Box>
          </SimpleGrid>

          {/* Last Heartbeat */}
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon
                as={FiClock}
                boxSize={3}
                color={heartbeat.isStale ? "orange.400" : "green.400"}
              />
              <Text fontSize="xs" color={textColor}>
                Last heartbeat:
              </Text>
            </HStack>
            <Tooltip
              label={
                agent.lastExecuted
                  ? new Date(agent.lastExecuted).toLocaleString()
                  : "Never executed"
              }
            >
              <Text
                fontSize="xs"
                fontWeight="medium"
                color={heartbeat.isStale ? "orange.500" : "green.500"}
              >
                {heartbeat.text}
              </Text>
            </Tooltip>
          </HStack>

          {/* Error Message */}
          {agent.status === "error" && agent.metrics.lastError && (
            <Box
              p={2}
              bg="red.50"
              borderColor="red.200"
              borderWidth="1px"
              borderRadius="md"
            >
              <Text fontSize="xs" color="red.600" noOfLines={2}>
                {agent.metrics.lastError}
              </Text>
            </Box>
          )}

          {/* Control Panel Button */}
          <Button
            size="sm"
            variant="outline"
            colorScheme={statusColor}
            leftIcon={<Icon as={FiSettings} />}
            onClick={() => onOpenControlPanel(agent.id)}
            isDisabled={agent.status === "maintenance"}
          >
            Control Panel
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}

interface AgentManagementDashboardProps {
  onOpenControlPanel?: (agentId: string) => void;
}

export default function AgentManagementDashboard({
  onOpenControlPanel = () => {},
}: AgentManagementDashboardProps) {
  const { agents, isLoading, setLoading, getAgentsByType } = useAgentStore();
  const { isConnected, onAgentStatusUpdate } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Responsive columns
  const columns = useBreakpointValue({
    base: 1,
    md: 2,
    lg: 3,
    xl: 4,
  });

  // Set up WebSocket listener for real-time updates
  useEffect(() => {
    const unsubscribe = onAgentStatusUpdate(_update => {
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [onAgentStatusUpdate]);

  // Simulate loading for initial state
  useEffect(() => {
    if (agents.length === 0 && !isLoading) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [agents.length, isLoading, setLoading]);

  // Get agents by type for organized display
  const monitoringAgents = getAgentsByType("monitoring");
  const analysisAgents = getAgentsByType("analysis");
  const rebalancingAgents = getAgentsByType("rebalancing");
  const alertAgents = getAgentsByType("alerts");

  // Create a combined list with type sections
  const allAgentsGrouped = [
    ...monitoringAgents.map(agent => ({ ...agent, section: "Monitoring" })),
    ...analysisAgents.map(agent => ({ ...agent, section: "Analysis" })),
    ...rebalancingAgents.map(agent => ({ ...agent, section: "Rebalancing" })),
    ...alertAgents.map(agent => ({ ...agent, section: "Alerts" })),
  ];

  // Calculate summary stats
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === "active").length;
  const errorAgents = agents.filter(a => a.status === "error").length;
  const avgSuccessRate =
    agents.length > 0
      ? (agents.reduce((sum, a) => sum + a.metrics.successRate, 0) /
          agents.length) *
        100
      : 0;

  if (isLoading) {
    return (
      <Box>
        <Heading mb={6} size="lg">
          Agent Management Dashboard
        </Heading>

        <SimpleGrid columns={columns} spacing={6}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton height="200px" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Agent Management Dashboard</Heading>

        <HStack spacing={4}>
          <Badge
            colorScheme={isConnected ? "green" : "red"}
            variant="subtle"
            fontSize="sm"
            px={3}
            py={1}
          >
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </Badge>

          {lastUpdate && (
            <Text fontSize="sm" color="gray.500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </HStack>
      </Flex>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <Card size="sm">
          <CardBody>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Total Agents
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {totalAgents}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardBody>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Active
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {activeAgents}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardBody>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Errors
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {errorAgents}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardBody>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Avg Success
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {avgSuccessRate.toFixed(1)}%
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions Panel */}
      <AgentQuickActions 
        agents={agents}
        onRefresh={() => {
          setLastUpdate(new Date());
          // In a real app, this would refetch agents from the API
        }}
      />
      
      <Box height={6} /> {/* Spacer */}

      {/* Agents Grid */}
      {allAgentsGrouped.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Icon as={FiActivity} boxSize={12} color="gray.300" mb={4} />
            <Heading size="md" color="gray.500" mb={2}>
              No Agents Available
            </Heading>
            <Text color="gray.500">
              Create your first AI agent to start monitoring your portfolio.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={columns} spacing={6}>
          {allAgentsGrouped.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onOpenControlPanel={onOpenControlPanel}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
