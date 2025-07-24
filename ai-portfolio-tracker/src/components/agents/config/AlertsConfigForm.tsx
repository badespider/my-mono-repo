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
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Code,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { Field, useFormikContext } from "formik";
import { 
  FiMail, 
  FiMessageSquare, 
  FiGlobe, 
  FiSlack,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiXCircle
} from "react-icons/fi";
import { AgentConfig } from "../../../services/types/api";

interface AlertsConfig extends AgentConfig {
  parameters: {
    channels: Array<"email" | "sms" | "webhook" | "discord" | "slack">;
    severityFilters: Array<"low" | "medium" | "high" | "critical">;
    cooldownPeriod: number;
    webhookUrl?: string;
  };
}

const NOTIFICATION_CHANNELS = [
  { 
    value: "email", 
    label: "Email", 
    description: "Send alerts via email",
    icon: FiMail,
    color: "blue"
  },
  { 
    value: "sms", 
    label: "SMS", 
    description: "Send text message alerts",
    icon: FiMessageSquare,
    color: "green"
  },
  { 
    value: "webhook", 
    label: "Webhook", 
    description: "Send to custom webhook endpoint",
    icon: FiGlobe,
    color: "purple"
  },
  { 
    value: "discord", 
    label: "Discord", 
    description: "Send to Discord channel",
    icon: FiMessageSquare,
    color: "indigo"
  },
  { 
    value: "slack", 
    label: "Slack", 
    description: "Send to Slack channel",
    icon: FiSlack,
    color: "pink"
  },
];

const SEVERITY_LEVELS = [
  { 
    value: "low", 
    label: "Low", 
    description: "Minor issues and informational alerts",
    icon: FiInfo,
    color: "gray"
  },
  { 
    value: "medium", 
    label: "Medium", 
    description: "Important issues that need attention",
    icon: FiAlertCircle,
    color: "yellow"
  },
  { 
    value: "high", 
    label: "High", 
    description: "Serious issues requiring prompt action",
    icon: FiAlertTriangle,
    color: "orange"
  },
  { 
    value: "critical", 
    label: "Critical", 
    description: "Critical issues requiring immediate action",
    icon: FiXCircle,
    color: "red"
  },
];

export function AlertsConfigForm() {
  const { values, errors, touched, setFieldValue } = useFormikContext<AlertsConfig>();

  const getChannelIcon = (channel: string) => {
    return NOTIFICATION_CHANNELS.find(c => c.value === channel)?.icon || FiGlobe;
  };

  const getChannelColor = (channel: string) => {
    return NOTIFICATION_CHANNELS.find(c => c.value === channel)?.color || "gray";
  };

  const getSeverityIcon = (severity: string) => {
    return SEVERITY_LEVELS.find(s => s.value === severity)?.icon || FiInfo;
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_LEVELS.find(s => s.value === severity)?.color || "gray";
  };

  const isWebhookEnabled = values.parameters.channels?.includes("webhook");

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
                  Enable or disable the alerts agent
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
                  min={30}
                  max={3600}
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
                  How often to check for alert conditions (minimum 30 seconds)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Alert Channels */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Notification Channels
        </Text>

        <Field name="parameters.channels">
          {({ field, form }: any) => (
            <FormControl isInvalid={form.errors.parameters?.channels && form.touched.parameters?.channels}>
              <FormLabel>Select Notification Channels</FormLabel>
              
              <CheckboxGroup
                value={field.value || []}
                onChange={(values) => form.setFieldValue(field.name, values)}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {NOTIFICATION_CHANNELS.map((channel) => {
                    const ChannelIcon = channel.icon;
                    return (
                      <Box
                        key={channel.value}
                        p={4}
                        border="2px solid"
                        borderColor={
                          field.value?.includes(channel.value) 
                            ? `${channel.color}.300` 
                            : "gray.200"
                        }
                        borderRadius="md"
                        bg={
                          field.value?.includes(channel.value) 
                            ? `${channel.color}.50` 
                            : "white"
                        }
                        transition="all 0.2s"
                      >
                        <Checkbox
                          value={channel.value}
                          colorScheme={channel.color}
                          size="lg"
                        >
                          <HStack spacing={3} align="flex-start">
                            <Icon 
                              as={ChannelIcon} 
                              color={`${channel.color}.500`} 
                              boxSize={5}
                              mt={1}
                            />
                            <VStack align="flex-start" spacing={1}>
                              <Text fontWeight="semibold" fontSize="md">
                                {channel.label}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {channel.description}
                              </Text>
                            </VStack>
                          </HStack>
                        </Checkbox>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </CheckboxGroup>

              {field.value && field.value.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Selected channels ({field.value.length}):
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {field.value.map((channelValue: string) => {
                      const channel = NOTIFICATION_CHANNELS.find(c => c.value === channelValue);
                      const ChannelIcon = getChannelIcon(channelValue);
                      return (
                        <Badge 
                          key={channelValue} 
                          colorScheme={getChannelColor(channelValue)} 
                          variant="solid"
                          px={3}
                          py={1}
                        >
                          <HStack spacing={1}>
                            <Icon as={ChannelIcon} boxSize={3} />
                            <Text>{channel?.label || channelValue}</Text>
                          </HStack>
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              )}

              <FormErrorMessage>{form.errors.parameters?.channels}</FormErrorMessage>
              <FormHelperText>
                Select at least one notification channel for alerts
              </FormHelperText>
            </FormControl>
          )}
        </Field>

        {/* Webhook URL */}
        {isWebhookEnabled && (
          <Field name="parameters.webhookUrl">
            {({ field, form }: any) => (
              <FormControl 
                isInvalid={form.errors.parameters?.webhookUrl && form.touched.parameters?.webhookUrl}
                mt={4}
              >
                <FormLabel htmlFor="webhookUrl">Webhook URL</FormLabel>
                <Input
                  {...field}
                  id="webhookUrl"
                  placeholder="https://your-webhook-endpoint.com/alerts"
                  type="url"
                />
                <FormErrorMessage>{form.errors.parameters?.webhookUrl}</FormErrorMessage>
                <FormHelperText>
                  URL endpoint to receive webhook alerts (required when webhook channel is selected)
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        )}
      </Box>

      <Divider />

      {/* Severity Filters */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Severity Filters
        </Text>

        <Field name="parameters.severityFilters">
          {({ field, form }: any) => (
            <FormControl isInvalid={form.errors.parameters?.severityFilters && form.touched.parameters?.severityFilters}>
              <FormLabel>Select Alert Severity Levels</FormLabel>
              
              <CheckboxGroup
                value={field.value || []}
                onChange={(values) => form.setFieldValue(field.name, values)}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {SEVERITY_LEVELS.map((severity) => {
                    const SeverityIcon = severity.icon;
                    return (
                      <Box
                        key={severity.value}
                        p={4}
                        border="2px solid"
                        borderColor={
                          field.value?.includes(severity.value) 
                            ? `${severity.color}.300` 
                            : "gray.200"
                        }
                        borderRadius="md"
                        bg={
                          field.value?.includes(severity.value) 
                            ? `${severity.color}.50` 
                            : "white"
                        }
                        transition="all 0.2s"
                      >
                        <Checkbox
                          value={severity.value}
                          colorScheme={severity.color}
                          size="lg"
                        >
                          <HStack spacing={3} align="flex-start">
                            <Icon 
                              as={SeverityIcon} 
                              color={`${severity.color}.500`} 
                              boxSize={5}
                              mt={1}
                            />
                            <VStack align="flex-start" spacing={1}>
                              <Text fontWeight="semibold" fontSize="md">
                                {severity.label}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {severity.description}
                              </Text>
                            </VStack>
                          </HStack>
                        </Checkbox>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </CheckboxGroup>

              {field.value && field.value.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Alert levels enabled ({field.value.length}):
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {field.value.map((severityValue: string) => {
                      const severity = SEVERITY_LEVELS.find(s => s.value === severityValue);
                      const SeverityIcon = getSeverityIcon(severityValue);
                      return (
                        <Badge 
                          key={severityValue} 
                          colorScheme={getSeverityColor(severityValue)} 
                          variant="solid"
                          px={3}
                          py={1}
                        >
                          <HStack spacing={1}>
                            <Icon as={SeverityIcon} boxSize={3} />
                            <Text>{severity?.label || severityValue}</Text>
                          </HStack>
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              )}

              <FormErrorMessage>{form.errors.parameters?.severityFilters}</FormErrorMessage>
              <FormHelperText>
                Select which severity levels should trigger alerts
              </FormHelperText>
            </FormControl>
          )}
        </Field>
      </Box>

      <Divider />

      {/* Alert Settings */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Alert Settings
        </Text>

        <Field name="parameters.cooldownPeriod">
          {({ field, form }: any) => (
            <FormControl isInvalid={form.errors.parameters?.cooldownPeriod && form.touched.parameters?.cooldownPeriod}>
              <FormLabel htmlFor="cooldownPeriod">Cooldown Period (seconds)</FormLabel>
              <NumberInput
                {...field}
                id="cooldownPeriod"
                min={60}
                max={86400}
                value={field.value}
                onChange={(_, valueAsNumber) =>
                  form.setFieldValue(field.name, valueAsNumber || 300)
                }
                onBlur={field.onBlur}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{form.errors.parameters?.cooldownPeriod}</FormErrorMessage>
              <FormHelperText>
                Minimum time between identical alerts to prevent spam (60 seconds - 24 hours)
              </FormHelperText>
            </FormControl>
          )}
        </Field>
      </Box>

      <Divider />

      {/* Notifications */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          System Notification Settings
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
                <FormHelperText>Agent status notifications</FormHelperText>
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
                <FormHelperText>Agent status via webhook</FormHelperText>
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
                <FormHelperText>Show agent status in dashboard</FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Mute Rules */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Mute Rules
        </Text>

        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Advanced Notification Control</Text>
            <Text fontSize="sm" mt={1}>
              Configure intelligent mute rules and notification preferences in the main settings.
              This agent will respect global mute rules and notification preferences.
            </Text>
          </Box>
        </Alert>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Field name="parameters.respectMuteRules">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="respectMuteRules">Respect Global Mute Rules</FormLabel>
                <Switch
                  {...field}
                  id="respectMuteRules"
                  isChecked={field.value ?? true}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="blue"
                />
                <FormHelperText>
                  Apply user-defined mute rules to this agent's alerts
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="parameters.emergencyOverride">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="emergencyOverride">Emergency Override</FormLabel>
                <Switch
                  {...field}
                  id="emergencyOverride"
                  isChecked={field.value ?? true}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="red"
                />
                <FormHelperText>
                  Critical alerts bypass all mute rules
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="parameters.quietHoursRespect">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="quietHoursRespect">Respect Quiet Hours</FormLabel>
                <Switch
                  {...field}
                  id="quietHoursRespect"
                  isChecked={field.value ?? true}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="purple"
                />
                <FormHelperText>
                  Honor user-defined quiet hours settings
                </FormHelperText>
              </FormControl>
            )}
          </Field>

          <Field name="parameters.contextualMuting">
            {({ field, form }: any) => (
              <FormControl>
                <FormLabel htmlFor="contextualMuting">Contextual Muting</FormLabel>
                <Switch
                  {...field}
                  id="contextualMuting"
                  isChecked={field.value ?? false}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  colorScheme="green"
                />
                <FormHelperText>
                  Auto-mute similar alerts within the cooldown period
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </SimpleGrid>

        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Mute Rule Priority Order:</Text>
          <VStack align="flex-start" spacing={1} fontSize="xs" color="gray.600">
            <Text>1. Emergency Override (Critical alerts always show)</Text>
            <Text>2. Global Mute Rules (User-defined conditions)</Text>
            <Text>3. Quiet Hours (Time-based muting)</Text>
            <Text>4. Contextual Muting (Similar alert suppression)</Text>
            <Text>5. Agent Severity Filters (This agent's settings)</Text>
          </VStack>
        </Box>
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
                  channels: values.parameters.channels || [],
                  severityFilters: values.parameters.severityFilters || [],
                  cooldownPeriod: `${values.parameters.cooldownPeriod}s`,
                  webhookUrl: isWebhookEnabled 
                    ? values.parameters.webhookUrl || "Not configured" 
                    : "Not required",
                  notifications: values.notifications,
                  muteRules: {
                    respectGlobal: values.parameters.respectMuteRules ?? true,
                    emergencyOverride: values.parameters.emergencyOverride ?? true,
                    quietHours: values.parameters.quietHoursRespect ?? true,
                    contextualMuting: values.parameters.contextualMuting ?? false,
                  },
                },
                null,
                2
              )}
            </Code>
          </Box>
        </Alert>

        {isWebhookEnabled && !values.parameters.webhookUrl && (
          <Alert status="warning" mt={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold">Webhook URL Required</Text>
              <Text fontSize="sm">
                You have selected webhook as a notification channel but haven't provided a webhook URL.
                Please add a valid webhook URL to receive alerts.
              </Text>
            </Box>
          </Alert>
        )}
      </Box>
    </VStack>
  );
}
