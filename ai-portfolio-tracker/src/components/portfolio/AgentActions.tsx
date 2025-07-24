import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  Box,
  Divider,
  Icon,
  Link,
  Tooltip,
  Empty,
} from "@chakra-ui/react";
import {
  HiExternalLink,
  HiRefresh,
  HiTrendingUp,
  HiTrendingDown,
  HiArrowRight,
  HiClock,
} from "react-icons/hi";
import type { Task } from "../../services/types/api";
import type { Agent } from "../../stores/agentStore";

interface AgentActionsProps {
  tasks: Task[];
  agents: Agent[];
}

interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  agentType: Agent["type"];
  action: string;
  description: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  impact: "high" | "medium" | "low";
  details?: {
    fromAsset?: string;
    toAsset?: string;
    amount?: number;
    value?: number;
  };
}

export const AgentActions: React.FC<AgentActionsProps> = ({ tasks, agents }) => {
  // Transform tasks into agent actions
  const agentActions: AgentAction[] = React.useMemo(() => {
    return tasks
      .filter(task => task.status === "completed" && task.output?.result)
      .map(task => {
        const agent = agents.find(a => a.id === task.agentId);
        
        // Extract action details from task output
        const result = task.output?.result;
        let action = "Executed task";
        let description = task.title || "Task completed";
        let details: AgentAction["details"] = {};

        // Parse rebalancing actions
        if (task.type === "rebalance" && result) {
          if (result.trades && result.trades.length > 0) {
            const trade = result.trades[0]; // Show first trade
            action = `Rebalanced ${trade.fromSymbol || "assets"}`;
            description = `${trade.amount || "Unknown amount"} ${trade.fromSymbol || ""} → ${trade.toSymbol || ""}`;
            details = {
              fromAsset: trade.fromSymbol,
              toAsset: trade.toSymbol,
              amount: trade.amount,
              value: trade.value,
            };
          }
        } else if (task.type === "analysis") {
          action = "Analyzed portfolio";
          description = result.summary || "Portfolio analysis completed";
        } else if (task.type === "alert") {
          action = "Triggered alert";
          description = result.message || "Alert condition detected";
        } else if (task.type === "monitor") {
          action = "Monitored positions";
          description = result.status || "Position monitoring completed";
        }

        return {
          id: task.id,
          agentId: task.agentId,
          agentName: agent?.name || "Unknown Agent",
          agentType: agent?.type || "monitoring",
          action,
          description,
          timestamp: task.completedAt || task.updatedAt,
          status: "success" as const,
          impact: task.priority === "critical" ? "high" : task.priority === "high" ? "medium" : "low",
          details,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Show last 10 actions
  }, [tasks, agents]);

  const getAgentTypeColor = (type: Agent["type"]) => {
    switch (type) {
      case "monitoring":
        return "blue";
      case "analysis":
        return "purple";
      case "rebalancing":
        return "green";
      case "alerts":
        return "orange";
      default:
        return "gray";
    }
  };

  const getAgentTypeIcon = (type: Agent["type"]) => {
    switch (type) {
      case "monitoring":
        return HiClock;
      case "analysis":
        return HiTrendingUp;
      case "rebalancing":
        return HiRefresh;
      case "alerts":
        return HiTrendingDown;
      default:
        return HiClock;
    }
  };

  const getImpactColor = (impact: AgentAction["impact"]) => {
    switch (impact) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (agentActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Agent Actions</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Icon as={HiRefresh} boxSize={8} color="gray.400" />
            <Text fontSize="md" color="gray.500" textAlign="center">
              No recent agent actions
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              Agent activities will appear here once they start executing tasks
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Agent Actions</Heading>
          <Badge colorScheme="blue" variant="subtle">
            {agentActions.length} recent
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {agentActions.map((action, index) => (
            <Box key={action.id}>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={action.agentName}
                      bg={`${getAgentTypeColor(action.agentType)}.500`}
                      color="white"
                    />
                    <VStack spacing={1} align="start">
                      <HStack>
                        <Text fontSize="sm" fontWeight="semibold">
                          {action.agentName}
                        </Text>
                        <Badge
                          colorScheme={getAgentTypeColor(action.agentType)}
                          variant="subtle"
                          size="sm"
                        >
                          {action.agentType}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatTimestamp(action.timestamp)}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <VStack spacing={1} align="end">
                    <Badge
                      colorScheme={getImpactColor(action.impact)}
                      variant="subtle"
                      size="sm"
                    >
                      {action.impact} impact
                    </Badge>
                  </VStack>
                </HStack>

                <Box pl={12}>
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon
                        as={getAgentTypeIcon(action.agentType)}
                        color={`${getAgentTypeColor(action.agentType)}.500`}
                        boxSize={4}
                      />
                      <Text fontSize="sm" fontWeight="medium">
                        {action.action}
                      </Text>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600">
                      {action.description}
                    </Text>

                    {/* Show trade details for rebalancing actions */}
                    {action.details?.fromAsset && action.details?.toAsset && (
                      <HStack
                        spacing={2}
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                        fontSize="sm"
                      >
                        <Badge colorScheme="red" variant="outline">
                          {action.details.fromAsset}
                        </Badge>
                        <Icon as={HiArrowRight} color="gray.400" />
                        <Badge colorScheme="green" variant="outline">
                          {action.details.toAsset}
                        </Badge>
                        {action.details.value && (
                          <Text color="gray.600" ml={2}>
                            ${action.details.value.toLocaleString()}
                          </Text>
                        )}
                      </HStack>
                    )}

                    <HStack spacing={2}>
                      <Tooltip label="View task details">
                        <Link
                          href={`/tasks/${action.id}`}
                          fontSize="xs"
                          color="blue.500"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          _hover={{ textDecoration: "underline" }}
                        >
                          View Details
                          <Icon as={HiExternalLink} boxSize={3} />
                        </Link>
                      </Tooltip>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
              
              {index < agentActions.length - 1 && <Divider mt={4} />}
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};
