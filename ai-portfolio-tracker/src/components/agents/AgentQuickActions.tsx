"use client";

import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiPlay,
  FiPause,
  FiActivity,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertTriangle,
  FiZap,
  FiSettings,
} from 'react-icons/fi';
import { useAgentTx } from '../../hooks/useAgentTx';
import { Agent } from '../../services/types/api';

interface AgentQuickActionsProps {
  agents: Agent[];
  onRefresh?: () => void;
}

const AGENT_TYPE_CONFIGS = {
  monitoring: {
    icon: FiActivity,
    color: 'blue',
    label: 'Monitor',
    description: 'Start portfolio monitoring agents',
  },
  analysis: {
    icon: FiTrendingUp,
    color: 'purple',
    label: 'Analyze',
    description: 'Run portfolio analysis agents',
  },
  rebalancing: {
    icon: FiRefreshCw,
    color: 'green',
    label: 'Rebalance',
    description: 'Execute rebalancing agents',
  },
  alerts: {
    icon: FiAlertTriangle,
    color: 'orange',
    label: 'Alert',
    description: 'Activate alert agents',
  },
} as const;

export default function AgentQuickActions({ agents, onRefresh }: AgentQuickActionsProps) {
  const {
    startAllAgentsMutation,
    stopAllAgentsMutation,
    monitorAgent,
    analyzeAgent,
    rebalanceAgent,
    alertAgent,
  } = useAgentTx();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOperation, setSelectedOperation] = React.useState<{
    type: 'start' | 'stop';
    agentType?: Agent['type'];
  } | null>(null);

  // Calculate agent statistics
  const agentStats = React.useMemo(() => {
    const stats = {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      error: agents.filter(a => a.status === 'error').length,
      byType: {} as Record<Agent['type'], { total: number; active: number; inactive: number }>,
    };

    // Calculate stats by type
    (['monitoring', 'analysis', 'rebalancing', 'alerts'] as Agent['type'][]).forEach(type => {
      const typeAgents = agents.filter(a => a.type === type);
      stats.byType[type] = {
        total: typeAgents.length,
        active: typeAgents.filter(a => a.status === 'active').length,
        inactive: typeAgents.filter(a => a.status === 'inactive').length,
      };
    });

    return stats;
  }, [agents]);

  const handleBulkOperation = async (type: 'start' | 'stop', agentType?: Agent['type']) => {
    try {
      if (type === 'start') {
        await startAllAgentsMutation.execute(agents, agentType);
      } else {
        await stopAllAgentsMutation.execute(agents, agentType);
      }
      onRefresh?.();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const handleTypeSpecificAction = async (agentType: Agent['type']) => {
    const typeAgents = agents.filter(a => a.type === agentType);
    if (typeAgents.length === 0) return;

    try {
      // For demo purposes, we'll run the first agent of this type
      const agent = typeAgents[0];
      const portfolioId = 'default-portfolio'; // This would come from context in a real app

      switch (agentType) {
        case 'monitoring':
          await monitorAgent.execute(agent, portfolioId);
          break;
        case 'analysis':
          await analyzeAgent.execute(agent, portfolioId);
          break;
        case 'rebalancing':
          await rebalanceAgent.execute(agent, portfolioId);
          break;
        case 'alerts':
          await alertAgent.execute(agent, { threshold: 0.05, email: true });
          break;
      }
      onRefresh?.();
    } catch (error) {
      console.error('Type-specific action failed:', error);
    }
  };

  const openConfirmModal = (type: 'start' | 'stop', agentType?: Agent['type']) => {
    setSelectedOperation({ type, agentType });
    onOpen();
  };

  const confirmOperation = () => {
    if (selectedOperation) {
      handleBulkOperation(selectedOperation.type, selectedOperation.agentType);
    }
    onClose();
    setSelectedOperation(null);
  };

  const isAnyLoading = startAllAgentsMutation.isLoading || 
                     stopAllAgentsMutation.isLoading ||
                     monitorAgent.isLoading ||
                     analyzeAgent.isLoading ||
                     rebalanceAgent.isLoading ||
                     alertAgent.isLoading;

  return (
    <>
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Agent Quick Actions</Heading>
            <Badge colorScheme="blue" variant="subtle">
              {agentStats.active}/{agentStats.total} Active
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Global Controls */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.600">
                Global Controls
              </Text>
              <ButtonGroup size="sm" isAttached variant="outline" width="full">
                <Button
                  flex="1"
                  leftIcon={<Icon as={FiPlay} />}
                  colorScheme="green"
                  onClick={() => openConfirmModal('start')}
                  isLoading={startAllAgentsMutation.isLoading}
                  isDisabled={isAnyLoading || agentStats.inactive === 0}
                >
                  Start All ({agentStats.inactive})
                </Button>
                <Button
                  flex="1"
                  leftIcon={<Icon as={FiPause} />}
                  colorScheme="red"
                  onClick={() => openConfirmModal('stop')}
                  isLoading={stopAllAgentsMutation.isLoading}
                  isDisabled={isAnyLoading || agentStats.active === 0}
                >
                  Pause All ({agentStats.active})
                </Button>
              </ButtonGroup>
            </Box>

            <Divider />

            {/* Type-Specific Controls */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.600">
                Agent Type Controls
              </Text>
              <SimpleGrid columns={2} spacing={3}>
                {(Object.entries(AGENT_TYPE_CONFIGS) as [Agent['type'], typeof AGENT_TYPE_CONFIGS[Agent['type']]][]).map(([type, config]) => {
                  const typeStats = agentStats.byType[type];
                  const hasAgents = typeStats.total > 0;
                  const hasActive = typeStats.active > 0;
                  const hasInactive = typeStats.inactive > 0;

                  return (
                    <VStack key={type} spacing={2}>
                      <HStack width="full" justify="space-between">
                        <HStack>
                          <Icon as={config.icon} color={`${config.color}.500`} />
                          <Text fontSize="xs" fontWeight="medium">
                            {config.label}
                          </Text>
                        </HStack>
                        <Badge size="sm" colorScheme={config.color} variant="subtle">
                          {typeStats.active}/{typeStats.total}
                        </Badge>
                      </HStack>
                      
                      <ButtonGroup size="xs" width="full">
                        <Tooltip label={config.description}>
                          <Button
                            flex="1"
                            leftIcon={<Icon as={FiZap} />}
                            colorScheme={config.color}
                            variant="solid"
                            onClick={() => handleTypeSpecificAction(type)}
                            isDisabled={!hasAgents || isAnyLoading}
                            size="xs"
                          >
                            Run
                          </Button>
                        </Tooltip>
                        <Button
                          size="xs"
                          leftIcon={<Icon as={FiPlay} />}
                          colorScheme="green"
                          variant="outline"
                          onClick={() => openConfirmModal('start', type)}
                          isDisabled={!hasInactive || isAnyLoading}
                        >
                          Start
                        </Button>
                        <Button
                          size="xs"
                          leftIcon={<Icon as={FiPause} />}
                          colorScheme="red"
                          variant="outline"
                          onClick={() => openConfirmModal('stop', type)}
                          isDisabled={!hasActive || isAnyLoading}
                        >
                          Stop
                        </Button>
                      </ButtonGroup>
                    </VStack>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Quick Stats */}
            <Box p={3} bg="gray.50" borderRadius="md">
              <SimpleGrid columns={3} spacing={4} textAlign="center">
                <VStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {agentStats.active}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Active</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.500">
                    {agentStats.inactive}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Inactive</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="red.500">
                    {agentStats.error}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Errors</Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>
            Confirm Agent Operation
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOperation && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to{' '}
                  <Text as="span" fontWeight="bold" color={selectedOperation.type === 'start' ? 'green.500' : 'red.500'}>
                    {selectedOperation.type}
                  </Text>
                  {selectedOperation.agentType ? (
                    <>
                      {' '}all <Text as="span" fontWeight="bold">{selectedOperation.agentType}</Text> agents?
                    </>
                  ) : (
                    ' all agents?'
                  )}
                </Text>
                
                {selectedOperation.agentType && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm">
                      This will affect {agentStats.byType[selectedOperation.agentType]?.total || 0} agents
                    </Text>
                  </Box>
                )}
                
                <Text fontSize="sm" color="gray.600">
                  This action will trigger Solana transactions and may require wallet signatures.
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={selectedOperation?.type === 'start' ? 'green' : 'red'}
                onClick={confirmOperation}
              >
                {selectedOperation?.type === 'start' ? 'Start' : 'Stop'} Agents
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
