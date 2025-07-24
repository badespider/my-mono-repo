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
  Tag,
  TagLabel,
  TagCloseButton,
  Button,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Code,
} from "@chakra-ui/react";
import { Field, FieldArray, useFormikContext } from "formik";
import { FiPlus, FiMinus } from "react-icons/fi";
import { AgentConfig } from "../../../services/types/api";

interface MonitoringConfig extends AgentConfig {
  parameters: {
    tokenList: string[];
    frequency: number;
    priceThreshold?: number;
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

export function MonitoringConfigForm() {
  const { values, errors, touched, setFieldValue } = useFormikContext<MonitoringConfig>();

  const addToken = (token: string) => {
    if (token && !values.parameters.tokenList.includes(token)) {
      setFieldValue("parameters.tokenList", [...values.parameters.tokenList, token]);
    }
  };

  const removeToken = (index: number) => {
    const newTokenList = values.parameters.tokenList.filter((_, i) => i !== index);
    setFieldValue("parameters.tokenList", newTokenList);
  };

  const addCommonToken = (token: string) => {
    addToken(token);
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
                  Enable or disable the monitoring agent
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="interval">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.interval && form.touched.interval}>
                <FormLabel htmlFor="interval">Check Interval (seconds)</FormLabel>
                <NumberInput
                  {...field}
                  id="interval"
                  min={1}
                  max={3600}
                  value={field.value / 1000} // Convert from ms to seconds for display
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, (valueAsNumber || 1) * 1000)
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
                  How often to check token prices (minimum 1 second)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Token Configuration */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Token Monitoring
        </Text>

        <VStack spacing={4} align="stretch">
          {/* Token List */}
          <FieldArray name="parameters.tokenList">
            {({ push, remove }) => (
              <FormControl 
                isInvalid={
                  errors.parameters?.tokenList && 
                  touched.parameters?.tokenList
                }
              >
                <FormLabel>Tokens to Monitor</FormLabel>
                
                {/* Current Tokens */}
                {values.parameters.tokenList.length > 0 && (
                  <Box mb={3}>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Currently monitoring:
                    </Text>
                    <HStack wrap="wrap" spacing={2}>
                      {values.parameters.tokenList.map((token, index) => (
                        <Tag key={index} size="md" colorScheme="blue" variant="solid">
                          <TagLabel>{token}</TagLabel>
                          <TagCloseButton onClick={() => removeToken(index)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}

                {/* Add Token Input */}
                <HStack>
                  <Input
                    placeholder="Enter token symbol (e.g., SOL, USDC)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addToken(input.value.toUpperCase());
                        input.value = "";
                      }
                    }}
                  />
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={(e) => {
                      const input = (e.target as HTMLElement)
                        .parentElement?.querySelector("input") as HTMLInputElement;
                      if (input) {
                        addToken(input.value.toUpperCase());
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </HStack>

                {/* Common Tokens */}
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Quick add common tokens:
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {COMMON_TOKENS.filter(
                      (token) => !values.parameters.tokenList.includes(token)
                    ).map((token) => (
                      <Button
                        key={token}
                        size="xs"
                        variant="outline"
                        onClick={() => addCommonToken(token)}
                      >
                        {token}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <FormErrorMessage>
                  {errors.parameters?.tokenList}
                </FormErrorMessage>
                <FormHelperText>
                  Add tokens to monitor. Press Enter or click Add to add each token.
                </FormHelperText>
              </FormControl>
            )}
          </FieldArray>

          {/* Frequency Configuration */}
          <Field name="parameters.frequency">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.frequency && form.touched.parameters?.frequency}>
                <FormLabel htmlFor="frequency">Monitoring Frequency (seconds)</FormLabel>
                <NumberInput
                  {...field}
                  id="frequency"
                  min={30}
                  max={3600}
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
                <FormErrorMessage>{form.errors.parameters?.frequency}</FormErrorMessage>
                <FormHelperText>
                  How often to fetch price data for tokens (minimum 30 seconds)
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          {/* Price Threshold */}
          <Field name="parameters.priceThreshold">
            {({ field, form }: any) => (
              <FormControl isInvalid={form.errors.parameters?.priceThreshold && form.touched.parameters?.priceThreshold}>
                <FormLabel htmlFor="priceThreshold">Price Change Threshold (%)</FormLabel>
                <NumberInput
                  {...field}
                  id="priceThreshold"
                  min={0.1}
                  max={100}
                  precision={2}
                  step={0.1}
                  value={field.value || 0}
                  onChange={(_, valueAsNumber) =>
                    form.setFieldValue(field.name, valueAsNumber)
                  }
                  onBlur={field.onBlur}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{form.errors.parameters?.priceThreshold}</FormErrorMessage>
                <FormHelperText>
                  Trigger alerts when price changes exceed this percentage (optional)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
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
                <FormHelperText>Send email alerts</FormHelperText>
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
                <FormHelperText>Send webhook alerts</FormHelperText>
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
                <FormHelperText>Show in-app alerts</FormHelperText>
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
                  tokens: values.parameters.tokenList,
                  frequency: `${values.parameters.frequency}s`,
                  priceThreshold: values.parameters.priceThreshold 
                    ? `${values.parameters.priceThreshold}%` 
                    : "disabled",
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
