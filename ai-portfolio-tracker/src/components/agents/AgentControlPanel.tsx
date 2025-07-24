"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Button,
  Badge,
  SimpleGrid,
  Spinner,
  Icon,
  Input,
  Select,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiX,
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
} from "react-icons/fi";
import { Agent } from "../../services/types/api";
import { agentsService } from "../../services/agents/agentsService";
import { useAgentTx } from "../../hooks/useAgentTx";
import AgentConfigForm from "./config/AgentConfigForm";

interface AgentControlPanelProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

interface MetricsData {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
}

interface LogEntry {
  timestamp: string;
  level: "error" | "warn" | "info" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}

interface AgentKPIs {
  successRate: number;
  errorRate: number;
  averageLatency: number;
  throughput: number;
  uptime: number;
  lastExecution: string;
  totalExecutions: number;
  failedExecutions: number;
}

const LOG_LEVEL_COLORS = {
  error: "red",
  warn: "orange",
  info: "blue",
  debug: "gray",
} as const;

export default function AgentControlPanel({
  agent,
  isOpen,
  onClose,
}: AgentControlPanelProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [kpis, setKPIs] = useState<AgentKPIs | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [logLevel, setLogLevel] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConfigForm, setShowConfigForm] = useState(false);
  
  // Use Virtuals Protocol agent transaction hook
  const {
    startAgent: startAgentTx,
    stopAgent: stopAgentTx,
    monitorAgent,
    analyzeAgent,
    rebalanceAgent,
    alertAgent,
  } = useAgentTx();

  // Initialize KPIs and simulated data
  useEffect(() => {
    if (!isOpen || !agent.id) return;

    // Initialize KPIs
    const successRate = agent.metrics?.successRate
      ? agent.metrics.successRate * 100
      : 95.5;
    const errorRate = 100 - successRate;
    const uptime = agent.metrics?.uptime ? agent.metrics.uptime / 3600 : 24.3;

    setKPIs({
      successRate,
      errorRate,
      averageLatency: agent.metrics?.averageExecutionTime || 245,
      throughput: agent.metrics?.executionCount
        ? agent.metrics.executionCount / 24
        : 12.5,
      uptime,
      lastExecution: agent.lastExecuted || new Date().toISOString(),
      totalExecutions: agent.metrics?.executionCount || 298,
      failedExecutions: Math.floor(
        (agent.metrics?.executionCount || 298) *
          (1 - (agent.metrics?.successRate || 0.955))
      ),
    });

    // Initialize some sample metrics
    const sampleMetrics: MetricsData[] = [];
    for (let i = 0; i < 20; i++) {
      sampleMetrics.push({
        timestamp: new Date(Date.now() - (20 - i) * 5000).toISOString(),
        cpu: 30 + Math.random() * 40,
        memory: 45 + Math.random() * 30,
        latency: 100 + Math.random() * 200,
      });
    }
    setMetricsData(sampleMetrics);

    // Initialize some sample logs
    const sampleLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Agent execution started successfully",
      },
      {
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: "debug",
        message: "Portfolio data fetched from API",
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "warn",
        message: "High memory usage detected",
      },
      {
        timestamp: new Date(Date.now() - 90000).toISOString(),
        level: "info",
        message: "Risk assessment completed",
      },
    ];
    setLogs(sampleLogs);
  }, [isOpen, agent.id]);

  const handleToggleAgent = async () => {
    setIsToggling(true);
    try {
      const isCurrentlyActive = agent.status === "active";
      const action = isCurrentlyActive ? "stop" : "start";

      // Call the appropriate service method
      if (isCurrentlyActive) {
        await agentsService.stopAgent(agent.id);
      } else {
        await agentsService.startAgent(agent.id);
      }

      console.log(`Agent ${action}ed successfully`);
    } catch (error) {
      console.error(
        `Failed to ${agent.status === "active" ? "stop" : "start"} agent:`,
        error
      );
    } finally {
      setIsToggling(false);
    }
  };

  const handleRestartAgent = async () => {
    try {
      await agentsService.restartAgent(agent.id);
      console.log("Agent restarted successfully");
    } catch (error) {
      console.error("Failed to restart agent:", error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevel === "all" || log.level === logLevel;
    const matchesFilter =
      logFilter === "" ||
      log.message.toLowerCase().includes(logFilter.toLowerCase());
    return matchesLevel && matchesFilter;
  });

  const isActive = agent.status === "active";

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        shadow="xl"
        width="90vw"
        maxWidth="1200px"
        maxHeight="90vh"
        overflow="hidden"
      >
        {/* Header */}
        <Box p={6} borderBottom="1px solid" borderColor="gray.200">
          <HStack spacing={4} justify="space-between">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {agent.name} Control Panel
              </Text>
              <Text fontSize="sm" color="gray.600">
                {agent.type} Agent • ID: {agent.id}
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Badge
                colorScheme={isActive ? "green" : "gray"}
                variant={isActive ? "solid" : "outline"}
                fontSize="sm"
              >
                {agent.status.toUpperCase()}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                leftIcon={<Icon as={FiX} />}
              >
                Close
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Content */}
        <Box p={6} maxHeight="calc(90vh - 120px)" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Control Section */}
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <HStack justify="space-between" align="center">
                <VStack align="flex-start" spacing={2}>
                  <Text fontWeight="semibold">Agent Control</Text>
                  <HStack>
                    <Switch
                      isChecked={isActive}
                      onChange={handleToggleAgent}
                      isDisabled={isToggling}
                      colorScheme="green"
                      size="lg"
                    />
                    <Text color="gray.600">
                      {isActive ? "Running" : "Stopped"}
                    </Text>
                    {isToggling && <Spinner size="sm" />}
                  </HStack>
                </VStack>

                <HStack spacing={3}>
                  <Button
                    leftIcon={<Icon as={FiSettings} />}
                    variant="outline"
                    size="sm"
                    colorScheme="blue"
                    onClick={() => setShowConfigForm(true)}
                  >
                    Configure
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiRefreshCw} />}
                    variant="outline"
                    size="sm"
                    onClick={handleRestartAgent}
                    isDisabled={!isActive}
                  >
                    Restart
                  </Button>
                  <Button
                    leftIcon={<Icon as={autoRefresh ? FiPause : FiPlay} />}
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    {autoRefresh ? "Pause" : "Resume"} Monitoring
                  </Button>
                </HStack>
              </HStack>
            </Box>

            {/* Virtuals Protocol Actions */}
            <Box
              p={4}
              border="1px solid"
              borderColor="purple.200"
              borderRadius="md"
              bg="purple.50"
            >
              <Text fontWeight="semibold" mb={4} color="purple.700">
                🚀 Virtuals Protocol Actions
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Execute blockchain-based agent operations using Virtuals Protocol smart contracts
              </Text>
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant={agent.status === 'active' ? 'outline' : 'solid'}
                  leftIcon={<Icon as={FiPlay} />}
                  onClick={() => startAgentTx.execute(agent)}
                  isLoading={startAgentTx.isLoading}
                  isDisabled={agent.status === 'active' || startAgentTx.isLoading}
                >
                  Start On-Chain
                </Button>
                
                <Button
                  size="sm"
                  colorScheme="red"
                  variant={agent.status === 'inactive' ? 'outline' : 'solid'}
                  leftIcon={<Icon as={FiPause} />}
                  onClick={() => stopAgentTx.execute(agent)}
                  isLoading={stopAgentTx.isLoading}
                  isDisabled={agent.status === 'inactive' || stopAgentTx.isLoading}
                >
                  Stop On-Chain
                </Button>
                
                {agent.type === 'monitoring' && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<Icon as={FiActivity} />}
                    onClick={() => monitorAgent.execute(agent, 'default-portfolio')}
                    isLoading={monitorAgent.isLoading}
                    isDisabled={monitorAgent.isLoading}
                  >
                    Monitor
                  </Button>
                )}
                
                {agent.type === 'analysis' && (
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    leftIcon={<Icon as={FiActivity} />}
                    onClick={() => analyzeAgent.execute(agent, 'default-portfolio')}
                    isLoading={analyzeAgent.isLoading}
                    isDisabled={analyzeAgent.isLoading}
                  >
                    Analyze
                  </Button>
                )}
                
                {agent.type === 'rebalancing' && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    leftIcon={<Icon as={FiRefreshCw} />}
                    onClick={() => rebalanceAgent.execute(agent, 'default-portfolio')}
                    isLoading={rebalanceAgent.isLoading}
                    isDisabled={rebalanceAgent.isLoading}
                  >
                    Rebalance
                  </Button>
                )}
                
                {agent.type === 'alerts' && (
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    leftIcon={<Icon as={FiActivity} />}
                    onClick={() => alertAgent.execute(agent, { threshold: 0.05, email: true })}
                    isLoading={alertAgent.isLoading}
                    isDisabled={alertAgent.isLoading}
                  >
                    Alert
                  </Button>
                )}
              </SimpleGrid>
              
              {(startAgentTx.error || stopAgentTx.error || monitorAgent.error || analyzeAgent.error || rebalanceAgent.error || alertAgent.error) && (
                <Box mt={3} p={2} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                  <Text fontSize="xs" color="red.600">
                    Error: {startAgentTx.error || stopAgentTx.error || monitorAgent.error || analyzeAgent.error || rebalanceAgent.error || alertAgent.error}
                  </Text>
                </Box>
              )}
            </Box>

            {/* KPIs Section */}
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Text fontWeight="semibold" mb={4}>
                Key Performance Indicators
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Success Rate
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {kpis?.successRate.toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    +2.3% vs last 24h
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Error Rate
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="red.500">
                    {kpis?.errorRate.toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    -0.5% vs last 24h
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Avg. Latency
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {kpis?.averageLatency.toFixed(0)}ms
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    +15ms vs last 24h
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Throughput
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {kpis?.throughput.toFixed(1)}/hr
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    +5.2% vs last 24h
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Tab Navigation */}
            <Box>
              <HStack
                spacing={4}
                mb={4}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                {["Real-time Metrics", "Live Logs", "Performance History"].map(
                  (tab, index) => (
                    <Button
                      key={index}
                      variant={currentTab === index ? "solid" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentTab(index)}
                      borderRadius="none"
                      borderBottom={currentTab === index ? "2px solid" : "none"}
                      borderColor="blue.500"
                    >
                      {tab}
                    </Button>
                  )
                )}
              </HStack>

              {/* Tab Content */}
              {currentTab === 0 && (
                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                  {/* CPU Usage */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        <Icon as={FiCpu} color="blue.500" />
                        <Text fontWeight="semibold" fontSize="sm">
                          CPU Usage
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {metricsData.length > 0
                          ? metricsData[metricsData.length - 1]?.cpu.toFixed(1)
                          : 0}
                        %
                      </Text>
                    </HStack>
                    <Box height="100px" bg="gray.50" borderRadius="md" p={2}>
                      <Text fontSize="xs" color="gray.500">
                        CPU metrics chart would be rendered here
                      </Text>
                    </Box>
                  </Box>

                  {/* Memory Usage */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        <Icon as={FiHardDrive} color="green.500" />
                        <Text fontWeight="semibold" fontSize="sm">
                          Memory Usage
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {metricsData.length > 0
                          ? metricsData[metricsData.length - 1]?.memory.toFixed(
                              1
                            )
                          : 0}
                        %
                      </Text>
                    </HStack>
                    <Box height="100px" bg="gray.50" borderRadius="md" p={2}>
                      <Text fontSize="xs" color="gray.500">
                        Memory metrics chart would be rendered here
                      </Text>
                    </Box>
                  </Box>

                  {/* Latency */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        <Icon as={FiWifi} color="orange.500" />
                        <Text fontWeight="semibold" fontSize="sm">
                          Latency
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {metricsData.length > 0
                          ? metricsData[
                              metricsData.length - 1
                            ]?.latency.toFixed(0)
                          : 0}
                        ms
                      </Text>
                    </HStack>
                    <Box height="100px" bg="gray.50" borderRadius="md" p={2}>
                      <Text fontSize="xs" color="gray.500">
                        Latency metrics chart would be rendered here
                      </Text>
                    </Box>
                  </Box>
                </SimpleGrid>
              )}

              {currentTab === 1 && (
                <Box
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  {/* Log Filters */}
                  <HStack spacing={4} mb={4}>
                    <Input
                      placeholder="Search logs..."
                      value={logFilter}
                      onChange={e => setLogFilter(e.target.value)}
                      size="sm"
                      maxWidth="300px"
                    />

                    <Select
                      value={logLevel}
                      onChange={e => setLogLevel(e.target.value)}
                      maxWidth="150px"
                      size="sm"
                    >
                      <option value="all">All Levels</option>
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </Select>

                    <Button
                      leftIcon={<Icon as={FiFilter} />}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogFilter("");
                        setLogLevel("all");
                      }}
                    >
                      Clear
                    </Button>
                  </HStack>

                  {/* Log Stream */}
                  <Box
                    height="300px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={3}
                    bg="gray.50"
                    fontFamily="mono"
                    fontSize="sm"
                  >
                    {filteredLogs.length === 0 ? (
                      <Text color="gray.500" textAlign="center" mt={8}>
                        No logs match the current filters
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={1}>
                        {filteredLogs.map((log, index) => (
                          <HStack key={index} spacing={3} align="flex-start">
                            <Text
                              color="gray.500"
                              fontSize="xs"
                              minWidth="80px"
                            >
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </Text>
                            <Badge
                              colorScheme={LOG_LEVEL_COLORS[log.level]}
                              size="sm"
                              minWidth="50px"
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <Text flex={1} lineHeight="short">
                              {log.message}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </Box>
              )}

              {currentTab === 2 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Text fontWeight="semibold" mb={4}>
                      Execution Summary
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Total Executions
                        </Text>
                        <Text fontWeight="semibold">
                          {kpis?.totalExecutions || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Failed Executions
                        </Text>
                        <Text fontWeight="semibold" color="red.500">
                          {kpis?.failedExecutions || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Uptime
                        </Text>
                        <Text fontWeight="semibold">
                          {kpis?.uptime.toFixed(1) || 0}h
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Last Execution
                        </Text>
                        <Text fontWeight="semibold" fontSize="sm">
                          {kpis?.lastExecution !== "Never"
                            ? new Date(
                                kpis?.lastExecution || ""
                              ).toLocaleString()
                            : "Never"}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Text fontWeight="semibold" mb={4}>
                      Health Status
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon
                            as={
                              kpis && kpis.successRate > 95
                                ? FiCheckCircle
                                : FiXCircle
                            }
                            color={
                              kpis && kpis.successRate > 95
                                ? "green.500"
                                : "red.500"
                            }
                          />
                          <Text fontSize="sm">Success Rate</Text>
                        </HStack>
                        <Text
                          fontWeight="semibold"
                          color={
                            kpis && kpis.successRate > 95
                              ? "green.500"
                              : "red.500"
                          }
                        >
                          {kpis && kpis.successRate > 95
                            ? "Healthy"
                            : "Degraded"}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <HStack>
                          <Icon
                            as={
                              kpis && kpis.averageLatency < 1000
                                ? FiCheckCircle
                                : FiXCircle
                            }
                            color={
                              kpis && kpis.averageLatency < 1000
                                ? "green.500"
                                : "orange.500"
                            }
                          />
                          <Text fontSize="sm">Response Time</Text>
                        </HStack>
                        <Text
                          fontWeight="semibold"
                          color={
                            kpis && kpis.averageLatency < 1000
                              ? "green.500"
                              : "orange.500"
                          }
                        >
                          {kpis && kpis.averageLatency < 1000 ? "Fast" : "Slow"}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiActivity} color="blue.500" />
                          <Text fontSize="sm">Status</Text>
                        </HStack>
                        <Badge
                          colorScheme={isActive ? "green" : "gray"}
                          variant={isActive ? "solid" : "outline"}
                        >
                          {agent.status.toUpperCase()}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </SimpleGrid>
              )}
            </Box>
          </VStack>
        </Box>
      </Box>
      
      {/* Configuration Form */}
      <AgentConfigForm
        agent={agent}
        isOpen={showConfigForm}
        onClose={() => setShowConfigForm(false)}
        onUpdate={(updatedAgent) => {
          // Handle agent update
          console.log('Agent updated:', updatedAgent);
          setShowConfigForm(false);
        }}
      />
    </Box>
  );
}
