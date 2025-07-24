"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  IconButton,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Code,
  Badge,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import { Field, FieldArray, useFormikContext } from "formik";
import { FiPlus, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { AgentConfig } from "../../../services/types/api";

interface RebalancingConfig extends AgentConfig {
  parameters: {
    threshold: number;
    targetAllocations: Array<{
      symbol: string;
      allocation: number;
    }>;
    maxSlippage: number;
    dryRun: boolean;
  };
}

const COMMON_TOKENS = [
  "SOL",
  "USDC",
  "BTC",
  "ETH",
  "RAY",
  "SRM",
  "STEP",
  "COPE",
  "MNGO",
  "FIDA",
];

export function RebalancingConfigForm() {
  const { values, errors, touched, setFieldValue } = useFormikContext<RebalancingConfig>();
  const [newToken, setNewToken] = useState("");

  const getTotalAllocation = () => {
    return values.parameters.targetAllocations.reduce(
      (sum, allocation) => sum + (allocation.allocation || 0),
      0
    );
  };

  const getAllocationColor = (total: number) => {
    if (Math.abs(total - 100) < 0.01) return "green";
    if (total > 100) return "red";
    return "yellow";
  };

  const addAllocation = () => {
    if (newToken && !values.parameters.targetAllocations.find(a => a.symbol === newToken)) {
      const newAllocations = [
        ...values.parameters.targetAllocations,
        { symbol: newToken, allocation: 0 }
      ];
      setFieldValue("parameters.targetAllocations", newAllocations);
      setNewToken("");
    }
  };

  const removeAllocation = (index: number) => {
    const newAllocations = values.parameters.targetAllocations.filter((_, i) => i !== index);
    setFieldValue("parameters.targetAllocations", newAllocations);
  };

  const updateAllocation = (index: number, allocation: number) => {
    const newAllocations = [...values.parameters.targetAllocations];
    newAllocations[index] = { ...newAllocations[index], allocation };
    setFieldValue("parameters.targetAllocations", newAllocations);
  };

  const normalizeAllocations = () => {
    const total = getTotalAllocation();
    if (total > 0) {
      const normalizedAllocations = values.parameters.targetAllocations.map(allocation => ({
        ...allocation,
        allocation: (allocation.allocation / total) * 100
      }));
      setFieldValue("parameters.targetAllocations", normalizedAllocations);
    }
  };

  const equalWeightAllocations = () => {
    const count = values.parameters.targetAllocations.length;
    if (count > 0) {
      const equalWeight = 100 / count;
      const equalAllocations = values.parameters.targetAllocations.map(allocation => ({
        ...allocation,
        allocation: equalWeight
      }));
      setFieldValue("parameters.targetAllocations", equalAllocations);
    }
  };

  const totalAllocation = getTotalAllocation();
  const allocationColor = getAllocationColor(totalAllocation);

  return (
    <VStack spacing={6} align="stretch">
      {/* Basic Configuration */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Basic Configuration
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Field name="enabled">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="enabled">Agent Enabled</FormLabel>
                <Switch
                  {...field}
                  id="enabled"
                  isChecked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="green"
                  size="lg"
                />
                <FormHelperText>
                  Enable or disable the rebalancing agent
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="interval">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.interval && form.touched.interval}>
                <FormLabel htmlFor="interval">Check Interval (minutes)</FormLabel>
                <NumberInput
                  {...field}
                  id="interval"
                  min={5}
                  max={1440}
                  value={field.value / (1000 * 60)}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, (valueAsNumber || 15) * 1000 * 60)
                  }
                  onBlur={field.onBlur}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{form.errors.interval}</FormErrorMessage>
                <FormHelperText>
                  How often to check for rebalancing needs (minimum 5 minutes)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Rebalancing Parameters */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Rebalancing Parameters
        </Text>

        <VStack spacing={4} align="stretch">
          {/* Threshold */}
          <Field name="parameters.threshold">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.threshold && form.touched.parameters?.threshold}>
                <FormLabel htmlFor="threshold">Rebalancing Threshold (%)</FormLabel>
                <NumberInput
                  {...field}
                  id="threshold"
                  min={1}
                  max={50}
                  precision={2}
                  step={0.5}
                  value={field.value}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, valueAsNumber || 5)
                  }
                  onBlur={field.onBlur}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{form.errors.parameters?.threshold}</FormErrorMessage>
                <FormHelperText>
                  Trigger rebalancing when allocation deviates by this percentage
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          {/* Max Slippage */}
          <Field name="parameters.maxSlippage">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.maxSlippage && form.touched.parameters?.maxSlippage}>
                <FormLabel htmlFor="maxSlippage">Maximum Slippage (%)</FormLabel>
                <NumberInput
                  {...field}
                  id="maxSlippage"
                  min={0.1}
                  max={10}
                  precision={2}
                  step={0.1}
                  value={field.value}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, valueAsNumber || 1)
                  }
                  onBlur={field.onBlur}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{form.errors.parameters?.maxSlippage}</FormErrorMessage>
                <FormHelperText>
                  Maximum acceptable slippage for trades
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          {/* Dry Run */}
          <Field name="parameters.dryRun">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="dryRun">Dry Run Mode</FormLabel>
                <Switch
                  {...field}
                  id="dryRun"
                  isChecked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="orange"
                  size="lg"
                />
                <FormHelperText>
                  {field.value 
                    ? "Simulate trades without executing them (recommended for testing)"
                    : "Execute actual trades (be careful with this setting)"
                  }
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </VStack>
      </Box>

      <Divider />

      {/* Target Allocations */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Target Allocations
        </Text>

        <VStack spacing={4} align="stretch">
          {/* Allocation Summary */}
          <Box p={4} bg="gray.50" borderRadius="md">
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold">Total Allocation</Text>
              <Badge colorScheme={allocationColor} fontSize="md">
                {totalAllocation.toFixed(2)}%
              </Badge>
            </HStack>
            <Progress 
              value={Math.min(totalAllocation, 100)} 
              colorScheme={allocationColor}
              size="lg"
              borderRadius="md"
            />
            {Math.abs(totalAllocation - 100) >= 0.01 && (
              <HStack mt={2}>
                <FiAlertTriangle color="orange" />
                <Text fontSize="sm" color="orange.600">
                  {totalAllocation > 100 
                    ? `Over-allocated by ${(totalAllocation - 100).toFixed(2)}%`
                    : `Under-allocated by ${(100 - totalAllocation).toFixed(2)}%`
                  }
                </Text>
              </HStack>
            )}
          </Box>

          {/* Add New Token */}
          <HStack>
            <Input
              placeholder="Enter token symbol (e.g., SOL, USDC)"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAllocation();
                }
              }}
            />
            <Button leftIcon={<FiPlus />} onClick={addAllocation} isDisabled={!newToken}>
              Add
            </Button>
          </HStack>

          {/* Quick Add Common Tokens */}
          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Quick add common tokens:
            </Text>
            <HStack wrap="wrap" spacing={2}>
              {COMMON_TOKENS.filter(
                token => !values.parameters.targetAllocations.find(a => a.symbol === token)
              ).map((token) => (
                <Button
                  key={token}
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setNewToken(token);
                    setTimeout(() => addAllocation(), 0);
                  }}
                >
                  {token}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Allocation List */}
          <FieldArray name="parameters.targetAllocations">
            {({ push, remove }) => (
              <VStack spacing={3} align="stretch">
                {values.parameters.targetAllocations.map((allocation, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <HStack spacing={4}>
                      <Box flex="1">
                        <Text fontWeight="semibold" mb={2}>
                          {allocation.symbol}
                        </Text>
                        <NumberInput
                          min={0}
                          max={100}
                          precision={2}
                          step={0.5}
                          value={allocation.allocation}
                          onChange={(_, valueAsNumber) =>
                            updateAllocation(index, valueAsNumber || 0)
                          }
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Box>
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.600">
                          Allocation
                        </Text>
                        <Badge colorScheme="blue" fontSize="sm">
                          {allocation.allocation.toFixed(2)}%
                        </Badge>
                      </VStack>
                      <Tooltip label="Remove token">
                        <IconButton
                          aria-label="Remove allocation"
                          icon={<FiTrash2 />}
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          onClick={() => removeAllocation(index)}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                ))}

                {values.parameters.targetAllocations.length === 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    Add tokens to set up your target portfolio allocation
                  </Alert>
                )}
              </VStack>
            )}
          </FieldArray>

          {/* Allocation Tools */}
          {values.parameters.targetAllocations.length > 0 && (
            <HStack spacing={3} justify="center">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={equalWeightAllocations}
              >
                Equal Weight
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={normalizeAllocations}
                isDisabled={totalAllocation === 0}
              >
                Normalize to 100%
              </Button>
            </HStack>
          )}

          {/* Allocation Error */}
          {errors.parameters?.targetAllocations && touched.parameters?.targetAllocations && (
            <Alert status="error">
              <AlertIcon />
              {String(errors.parameters.targetAllocations)}
            </Alert>
          )}
        </VStack>
      </Box>

      <Divider />

      {/* Notifications */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Notification Settings
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Field name="notifications.email">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="notifications.email">Email Notifications</FormLabel>
                <Switch
                  {...field}
                  id="notifications.email"
                  isChecked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="blue"
                />
                <FormHelperText>Send rebalancing alerts via email</FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="notifications.webhook">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="notifications.webhook">Webhook Notifications</FormLabel>
                <Switch
                  {...field}
                  id="notifications.webhook"
                  isChecked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="blue"
                />
                <FormHelperText>Send to webhook endpoint</FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="notifications.inApp">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="notifications.inApp">In-App Notifications</FormLabel>
                <Switch
                  {...field}
                  id="notifications.inApp"
                  isChecked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="blue"
                />
                <FormHelperText>Show rebalancing status in dashboard</FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Configuration Preview */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Configuration Preview
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Current Configuration:</Text>
            <Code display="block" whiteSpace="pre-wrap" mt={2} p={2} fontSize="sm">
              {JSON.stringify(
                {
                  enabled: values.enabled,
                  interval: `${values.interval / (1000 * 60)} minutes`,
                  threshold: `${values.parameters.threshold}%`,
                  maxSlippage: `${values.parameters.maxSlippage}%`,
                  dryRun: values.parameters.dryRun,
                  targetAllocations: values.parameters.targetAllocations.map(a => 
                    `${a.symbol}: ${a.allocation.toFixed(2)}%`
                  ),
                  totalAllocation: `${totalAllocation.toFixed(2)}%`,
                  notifications: values.notifications,
                },
                null,
                2
              )}
            </Code>
          </Box>
        </Alert>

        {!values.parameters.dryRun && (
          <Alert status="warning" mt={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold">Warning: Live Trading Enabled</Text>
              <Text fontSize="sm">
                Dry run mode is disabled. This agent will execute real trades using your funds.
                Make sure you understand the risks before proceeding.
              </Text>
            </Box>
          </Alert>
        )}
      </Box>
    </VStack>
  );
}
