"use client";

import React from "react";
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
  Select,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Code,
  Badge,
} from "@chakra-ui/react";
import { Field, FieldArray, useFormikContext } from "formik";
import { AgentConfig } from "../../../services/types/api";

interface AnalysisConfig extends AgentConfig {
  parameters: {
    strategyType: "momentum" | "mean_reversion" | "trend_following" | "technical";
    lookbackPeriod: number;
    riskTolerance: "low" | "medium" | "high";
    indicators: string[];
  };
}

const STRATEGY_TYPES = [
  { value: "momentum", label: "Momentum", description: "Follow price momentum trends" },
  { value: "mean_reversion", label: "Mean Reversion", description: "Buy low, sell high based on historical averages" },
  { value: "trend_following", label: "Trend Following", description: "Follow established market trends" },
  { value: "technical", label: "Technical Analysis", description: "Use technical indicators for decisions" },
];

const RISK_TOLERANCE_LEVELS = [
  { value: "low", label: "Conservative", description: "Low risk, stable returns", color: "green" },
  { value: "medium", label: "Moderate", description: "Balanced risk/reward", color: "yellow" },
  { value: "high", label: "Aggressive", description: "High risk, high potential returns", color: "red" },
];

const TECHNICAL_INDICATORS = [
  { value: "sma", label: "Simple Moving Average (SMA)", category: "Trend" },
  { value: "ema", label: "Exponential Moving Average (EMA)", category: "Trend" },
  { value: "rsi", label: "Relative Strength Index (RSI)", category: "Momentum" },
  { value: "macd", label: "MACD", category: "Momentum" },
  { value: "bollinger_bands", label: "Bollinger Bands", category: "Volatility" },
  { value: "stochastic", label: "Stochastic Oscillator", category: "Momentum" },
  { value: "atr", label: "Average True Range (ATR)", category: "Volatility" },
  { value: "volume_sma", label: "Volume SMA", category: "Volume" },
  { value: "obv", label: "On-Balance Volume (OBV)", category: "Volume" },
  { value: "williams_r", label: "Williams %R", category: "Momentum" },
];

const INDICATOR_CATEGORIES = ["Trend", "Momentum", "Volatility", "Volume"];

export function AnalysisConfigForm() {
  const { values, errors, touched, setFieldValue } = useFormikContext<AnalysisConfig>();

  const getStrategyDescription = (strategyType: string) => {
    return STRATEGY_TYPES.find(s => s.value === strategyType)?.description || "";
  };

  const getRiskDescription = (riskLevel: string) => {
    return RISK_TOLERANCE_LEVELS.find(r => r.value === riskLevel)?.description || "";
  };

  const getRiskColor = (riskLevel: string) => {
    return RISK_TOLERANCE_LEVELS.find(r => r.value === riskLevel)?.color || "gray";
  };

  const getIndicatorsByCategory = (category: string) => {
    return TECHNICAL_INDICATORS.filter(indicator => indicator.category === category);
  };

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
                  Enable or disable the analysis agent
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="interval">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.interval && form.touched.interval}>
                <FormLabel htmlFor="interval">Analysis Interval (seconds)</FormLabel>
                <NumberInput
                  {...field}
                  id="interval"
                  min={60}
                  max={86400}
                  value={field.value / 1000}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, (valueAsNumber || 60) * 1000)
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
                  How often to run analysis (minimum 60 seconds)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Strategy Configuration */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Strategy Configuration
        </Text>

        <VStack spacing={4} align="stretch">
          {/* Strategy Type */}
          <Field name="parameters.strategyType">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.strategyType && form.touched.parameters?.strategyType}>
                <FormLabel htmlFor="strategyType">Strategy Type</FormLabel>
                <Select
                  {...field}
                  id="strategyType"
                  placeholder="Select a strategy type"
                  onChange={(e) => form.setFieldValue(field.name, e.target.value)}
                >
                  {STRATEGY_TYPES.map((strategy) => (
                    <option key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </option>
                  ))}
                </Select>
                {field.value && (
                  <FormHelperText color="blue.600" fontStyle="italic">
                    {getStrategyDescription(field.value)}
                  </FormHelperText>
                )}
                <FormErrorMessage>{form.errors.parameters?.strategyType}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          {/* Lookback Period */}
          <Field name="parameters.lookbackPeriod">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.lookbackPeriod && form.touched.parameters?.lookbackPeriod}>
                <FormLabel htmlFor="lookbackPeriod">Lookback Period (days)</FormLabel>
                <NumberInput
                  {...field}
                  id="lookbackPeriod"
                  min={1}
                  max={365}
                  value={field.value}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, valueAsNumber || 30)
                  }
                  onBlur={field.onBlur}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{form.errors.parameters?.lookbackPeriod}</FormErrorMessage>
                <FormHelperText>
                  Historical data period to analyze (1-365 days)
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          {/* Risk Tolerance */}
          <Field name="parameters.riskTolerance">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.riskTolerance && form.touched.parameters?.riskTolerance}>
                <FormLabel htmlFor="riskTolerance">Risk Tolerance</FormLabel>
                <Select
                  {...field}
                  id="riskTolerance"
                  placeholder="Select risk tolerance"
                  onChange={(e) => form.setFieldValue(field.name, e.target.value)}
                >
                  {RISK_TOLERANCE_LEVELS.map((risk) => (
                    <option key={risk.value} value={risk.value}>
                      {risk.label}
                    </option>
                  ))}
                </Select>
                {field.value && (
                  <HStack mt={2}>
                    <Badge colorScheme={getRiskColor(field.value)} variant="solid">
                      {field.value.toUpperCase()}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {getRiskDescription(field.value)}
                    </Text>
                  </HStack>
                )}
                <FormErrorMessage>{form.errors.parameters?.riskTolerance}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
        </VStack>
      </Box>

      <Divider />

      {/* Technical Indicators */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Technical Indicators
        </Text>

        <Field name="parameters.indicators">
          {({ field, form }: any) => (
            <FormControl isInvalid={form.errors.parameters?.indicators && form.touched.parameters?.indicators}>
              <FormLabel>Select Indicators to Use</FormLabel>
              
              <CheckboxGroup
                value={field.value || []}
                onChange={(values) => form.setFieldValue(field.name, values)}
              >
                <VStack spacing={4} align="stretch">
                  {INDICATOR_CATEGORIES.map((category) => (
                    <Box key={category}>
                      <Text fontWeight="semibold" fontSize="md" mb={2} color="gray.700">
                        {category} Indicators
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {getIndicatorsByCategory(category).map((indicator) => (
                          <Checkbox
                            key={indicator.value}
                            value={indicator.value}
                            colorScheme="blue"
                          >
                            <Text fontSize="sm">{indicator.label}</Text>
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </CheckboxGroup>

              {field.value && field.value.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Selected indicators ({field.value.length}):
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {field.value.map((indicatorValue: string) => {
                      const indicator = TECHNICAL_INDICATORS.find(i => i.value === indicatorValue);
                      return (
                        <Badge key={indicatorValue} colorScheme="blue" variant="outline">
                          {indicator?.label || indicatorValue}
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              )}

              <FormErrorMessage>{form.errors.parameters?.indicators}</FormErrorMessage>
              <FormHelperText>
                Select at least one technical indicator for analysis
              </FormHelperText>
            </FormControl>
          )}
        </Field>
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
                <FormHelperText>Send analysis results via email</FormHelperText>
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
                <FormHelperText>Show results in dashboard</FormHelperText>
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
                  interval: `${values.interval / 1000}s`,
                  strategy: values.parameters.strategyType,
                  lookbackPeriod: `${values.parameters.lookbackPeriod} days`,
                  riskTolerance: values.parameters.riskTolerance,
                  indicators: values.parameters.indicators?.length || 0,
                  notifications: values.notifications,
                },
                null,
                2
              )}
            </Code>
          </Box>
        </Alert>
      </Box>
    </VStack>
  );
}
