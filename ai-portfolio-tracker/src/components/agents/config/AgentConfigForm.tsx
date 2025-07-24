"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Code,
  Divider,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiSave, FiEye } from "react-icons/fi";
import { Agent, AgentConfig } from "../../../services/types/api";
import { agentsService } from "../../../services/agents/agentsService";
import { MonitoringConfigForm } from "./MonitoringConfigForm";
import { AnalysisConfigForm } from "./AnalysisConfigForm";
import { RebalancingConfigForm } from "./RebalancingConfigForm";
import { AlertsConfigForm } from "./AlertsConfigForm";

interface AgentConfigFormProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (agent: Agent) => void;
}

// Validation schemas for each agent type
const getValidationSchema = (agentType: Agent["type"]) => {
  const baseSchema = {
    enabled: Yup.boolean().required("Enabled status is required"),
    interval: Yup.number()
      .positive("Interval must be positive")
      .min(1000, "Minimum interval is 1 second")
      .required("Interval is required"),
    notifications: Yup.object({
      email: Yup.boolean().required(),
      webhook: Yup.boolean().required(),
      inApp: Yup.boolean().required(),
    }).required(),
  };

  switch (agentType) {
    case "monitoring":
      return Yup.object({
        ...baseSchema,
        parameters: Yup.object({
          tokenList: Yup.array()
            .of(Yup.string().required("Token symbol is required"))
            .min(1, "At least one token is required")
            .required("Token list is required"),
          frequency: Yup.number()
            .positive("Frequency must be positive")
            .min(30, "Minimum frequency is 30 seconds")
            .required("Frequency is required"),
          priceThreshold: Yup.number()
            .positive("Price threshold must be positive")
            .max(100, "Price threshold cannot exceed 100%")
            .optional(),
        }).required(),
      });

    case "analysis":
      return Yup.object({
        ...baseSchema,
        parameters: Yup.object({
          strategyType: Yup.string()
            .oneOf(["momentum", "mean_reversion", "trend_following", "technical"], "Invalid strategy type")
            .required("Strategy type is required"),
          lookbackPeriod: Yup.number()
            .positive("Lookback period must be positive")
            .min(1, "Minimum lookback period is 1 day")
            .max(365, "Maximum lookback period is 365 days")
            .required("Lookback period is required"),
          riskTolerance: Yup.string()
            .oneOf(["low", "medium", "high"], "Invalid risk tolerance")
            .required("Risk tolerance is required"),
          indicators: Yup.array()
            .of(Yup.string().required("Indicator is required"))
            .min(1, "At least one indicator is required")
            .required("Indicators are required"),
        }).required(),
      });

    case "rebalancing":
      return Yup.object({
        ...baseSchema,
        parameters: Yup.object({
          threshold: Yup.number()
            .positive("Threshold must be positive")
            .min(1, "Minimum threshold is 1%")
            .max(50, "Maximum threshold is 50%")
            .required("Threshold is required"),
          targetAllocations: Yup.array()
            .of(
              Yup.object({
                symbol: Yup.string().required("Symbol is required"),
                allocation: Yup.number()
                  .positive("Allocation must be positive")
                  .max(100, "Allocation cannot exceed 100%")
                  .required("Allocation is required"),
              })
            )
            .test("sum-100", "Total allocation must equal 100%", (allocations) => {
              if (!allocations) return false;
              const sum = allocations.reduce((acc, curr) => acc + curr.allocation, 0);
              return Math.abs(sum - 100) < 0.01; // Allow for floating point precision
            })
            .min(1, "At least one allocation is required")
            .required("Target allocations are required"),
          maxSlippage: Yup.number()
            .positive("Max slippage must be positive")
            .max(10, "Max slippage cannot exceed 10%")
            .required("Max slippage is required"),
          dryRun: Yup.boolean().required("Dry run setting is required"),
        }).required(),
      });

    case "alerts":
      return Yup.object({
        ...baseSchema,
        parameters: Yup.object({
          channels: Yup.array()
            .of(Yup.string().oneOf(["email", "sms", "webhook", "discord", "slack"], "Invalid channel"))
            .min(1, "At least one channel is required")
            .required("Channels are required"),
          severityFilters: Yup.array()
            .of(Yup.string().oneOf(["low", "medium", "high", "critical"], "Invalid severity"))
            .min(1, "At least one severity level is required")
            .required("Severity filters are required"),
          cooldownPeriod: Yup.number()
            .positive("Cooldown period must be positive")
            .min(60, "Minimum cooldown is 60 seconds")
            .required("Cooldown period is required"),
          webhookUrl: Yup.string().url("Invalid webhook URL").optional(),
        }).required(),
      });

    default:
      return Yup.object(baseSchema);
  }
};

export default function AgentConfigForm({
  agent,
  isOpen,
  onClose,
  onUpdate,
}: AgentConfigFormProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [configDiff, setConfigDiff] = useState<{
    original: AgentConfig;
    updated: AgentConfig;
  } | null>(null);
  const toast = useToast();

  const validationSchema = getValidationSchema(agent.type);

  const handleSubmit = async (values: AgentConfig) => {
    try {
      // Show diff first
      setConfigDiff({
        original: agent.config,
        updated: values,
      });
      setShowDiff(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare configuration update",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleConfirmUpdate = async () => {
    if (!configDiff) return;

    try {
      const updatedAgent = await agentsService.updateAgentConfig(
        agent.id,
        configDiff.updated
      );

      toast({
        title: "Configuration Updated",
        description: `${agent.name} configuration has been successfully updated`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onUpdate?.(updatedAgent);
      setShowDiff(false);
      setConfigDiff(null);
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update agent configuration",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderTypeSpecificForm = (agentType: Agent["type"]) => {
    switch (agentType) {
      case "monitoring":
        return <MonitoringConfigForm />;
      case "analysis":
        return <AnalysisConfigForm />;
      case "rebalancing":
        return <RebalancingConfigForm />;
      case "alerts":
        return <AlertsConfigForm />;
      default:
        return (
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle mr={2}>Unsupported Agent Type</AlertTitle>
            <AlertDescription>
              Configuration form for agent type "{agentType}" is not yet implemented.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const formatConfigDiff = (original: AgentConfig, updated: AgentConfig) => {
    const diff: string[] = [];
    
    // Compare top-level properties
    if (original.enabled !== updated.enabled) {
      diff.push(`- enabled: ${original.enabled} → ${updated.enabled}`);
    }
    if (original.interval !== updated.interval) {
      diff.push(`- interval: ${original.interval}ms → ${updated.interval}ms`);
    }
    
    // Compare notifications
    if (JSON.stringify(original.notifications) !== JSON.stringify(updated.notifications)) {
      diff.push(`- notifications: ${JSON.stringify(original.notifications)} → ${JSON.stringify(updated.notifications)}`);
    }
    
    // Compare parameters (shallow comparison for now)
    if (JSON.stringify(original.parameters) !== JSON.stringify(updated.parameters)) {
      diff.push(`- parameters: Configuration parameters updated`);
    }
    
    return diff.length > 0 ? diff : ["No changes detected"];
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !showDiff}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            Configure {agent.name}
            <Text fontSize="sm" color="gray.500" fontWeight="normal">
              {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent Configuration
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <Formik
            initialValues={agent.config}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, errors, touched }) => (
              <Form>
                <ModalBody>
                  <VStack spacing={6} align="stretch">
                    {/* Validation Errors Summary */}
                    {Object.keys(errors).length > 0 && touched && (
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Please fix the following errors:</AlertTitle>
                          <AlertDescription>
                            <ul>
                              {Object.entries(errors).map(([field, error]) => (
                                <li key={field}>
                                  <strong>{field}:</strong> {String(error)}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {/* Type-specific configuration form */}
                    {renderTypeSpecificForm(agent.type)}
                  </VStack>
                </ModalBody>

                <ModalFooter>
                  <HStack spacing={3}>
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      leftIcon={<FiEye />}
                      isLoading={isSubmitting}
                      loadingText="Preparing..."
                    >
                      Preview Changes
                    </Button>
                  </HStack>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      {/* Configuration Diff Modal */}
      <Modal
        isOpen={showDiff}
        onClose={() => {
          setShowDiff(false);
          setConfigDiff(null);
        }}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Configuration Changes</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                The following changes will be applied to <strong>{agent.name}</strong>:
              </Text>

              {configDiff && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Changes:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {formatConfigDiff(configDiff.original, configDiff.updated).join('\n')}
                  </Code>
                </Box>
              )}

              <Divider />

              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  These changes will be applied immediately and may affect the agent's
                  behavior. Make sure you want to proceed.
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDiff(false);
                  setConfigDiff(null);
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<FiSave />}
                onClick={handleConfirmUpdate}
              >
                Apply Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
