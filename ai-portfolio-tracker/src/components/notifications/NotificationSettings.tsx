"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Divider,
  Button,
  IconButton,
  Badge,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  Code,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiInfo,
  FiAlertTriangle,
  FiClock,
  FiVolume,
  FiVolumeX,
  FiSettings,
} from "react-icons/fi";
import { useAlertStore } from "@/stores/alertStore";

interface MuteRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: {
    severity?: string[];
    type?: string[];
    agentId?: string[];
    portfolioId?: string[];
    keywords?: string[];
    timeRange?: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
  };
  duration?: {
    type: "permanent" | "temporary";
    endTime?: string; // ISO string for temporary mutes
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferences {
  enableToasts: boolean;
  enableSounds: boolean;
  enableDesktopNotifications: boolean;
  showAllNotifications: boolean; // Show info/warning in addition to error/critical
  toastDuration: number; // seconds
  maxConcurrentToasts: number;
  muteRules: MuteRule[];
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableToasts: true,
  enableSounds: false,
  enableDesktopNotifications: false,
  showAllNotifications: false,
  toastDuration: 5,
  maxConcurrentToasts: 5,
  muteRules: [],
};

interface MuteRuleFormProps {
  rule?: MuteRule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: MuteRule) => void;
}

function MuteRuleForm({ rule, isOpen, onClose, onSave }: MuteRuleFormProps) {
  const [formData, setFormData] = useState<Partial<MuteRule>>({
    name: "",
    description: "",
    enabled: true,
    conditions: {},
    duration: { type: "permanent" },
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        name: "",
        description: "",
        enabled: true,
        conditions: {},
        duration: { type: "permanent" },
      });
    }
  }, [rule, isOpen]);

  const handleSave = () => {
    const newRule: MuteRule = {
      id: rule?.id || `rule-${Date.now()}`,
      name: formData.name || "Unnamed Rule",
      description: formData.description,
      enabled: formData.enabled ?? true,
      conditions: formData.conditions || {},
      duration: formData.duration || { type: "permanent" },
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRule);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {rule ? "Edit Mute Rule" : "Create Mute Rule"}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Basic Info */}
            <FormControl>
              <FormLabel>Rule Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mute overnight alerts"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe when this rule should apply"
                rows={2}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Rule Status</FormLabel>
              <Switch
                isChecked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
              <FormHelperText>
                Enable or disable this rule
              </FormHelperText>
            </FormControl>

            <Divider />

            {/* Conditions */}
            <Text fontWeight="semibold">Mute Conditions</Text>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Severity Levels</FormLabel>
                <CheckboxGroup
                  value={formData.conditions?.severity || []}
                  onChange={(values) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      severity: values as string[],
                    },
                  })}
                >
                  <VStack align="flex-start">
                    <Checkbox value="info">Info</Checkbox>
                    <Checkbox value="warning">Warning</Checkbox>
                    <Checkbox value="error">Error</Checkbox>
                    <Checkbox value="critical">Critical</Checkbox>
                  </VStack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Alert Types</FormLabel>
                <CheckboxGroup
                  value={formData.conditions?.type || []}
                  onChange={(values) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      type: values as string[],
                    },
                  })}
                >
                  <VStack align="flex-start">
                    <Checkbox value="price">Price</Checkbox>
                    <Checkbox value="portfolio">Portfolio</Checkbox>
                    <Checkbox value="system">System</Checkbox>
                    <Checkbox value="agent">Agent</Checkbox>
                  </VStack>
                </CheckboxGroup>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Keywords to Mute</FormLabel>
              <Input
                value={formData.conditions?.keywords?.join(", ") || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: {
                    ...formData.conditions,
                    keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k),
                  },
                })}
                placeholder="e.g., maintenance, test, demo"
              />
              <FormHelperText>
                Comma-separated keywords to match in alert titles or messages
              </FormHelperText>
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Quiet Hours Start</FormLabel>
                <Input
                  type="time"
                  value={formData.conditions?.timeRange?.start || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      timeRange: {
                        ...formData.conditions?.timeRange,
                        start: e.target.value,
                      },
                    },
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Quiet Hours End</FormLabel>
                <Input
                  type="time"
                  value={formData.conditions?.timeRange?.end || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      timeRange: {
                        ...formData.conditions?.timeRange,
                        end: e.target.value,
                      },
                    },
                  })}
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Duration */}
            <Text fontWeight="semibold">Mute Duration</Text>

            <FormControl>
              <FormLabel>Duration Type</FormLabel>
              <Select
                value={formData.duration?.type || "permanent"}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: {
                    ...formData.duration,
                    type: e.target.value as "permanent" | "temporary",
                  },
                })}
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </Select>
            </FormControl>

            {formData.duration?.type === "temporary" && (
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.duration?.endTime ? 
                    new Date(formData.duration.endTime).toISOString().slice(0, 16) : 
                    ""
                  }
                  onChange={(e) => setFormData({
                    ...formData,
                    duration: {
                      ...formData.duration,
                      endTime: new Date(e.target.value).toISOString(),
                    },
                  })}
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            {rule ? "Update" : "Create"} Rule
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [selectedRule, setSelectedRule] = useState<MuteRule | undefined>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }
    }
  }, []);

  // Save preferences to localStorage when changed
  useEffect(() => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    
    // Update global settings
    localStorage.setItem("showAllNotifications", preferences.showAllNotifications.toString());
    localStorage.setItem("enableDesktopNotifications", preferences.enableDesktopNotifications.toString());
  }, [preferences]);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveRule = (rule: MuteRule) => {
    setPreferences(prev => ({
      ...prev,
      muteRules: prev.muteRules.some(r => r.id === rule.id)
        ? prev.muteRules.map(r => r.id === rule.id ? rule : r)
        : [...prev.muteRules, rule],
    }));
  };

  const handleDeleteRule = (ruleId: string) => {
    setPreferences(prev => ({
      ...prev,
      muteRules: prev.muteRules.filter(r => r.id !== ruleId),
    }));
  };

  const handleEditRule = (rule: MuteRule) => {
    setSelectedRule(rule);
    onOpen();
  };

  const handleCreateRule = () => {
    setSelectedRule(undefined);
    onOpen();
  };

  const activeMuteRules = preferences.muteRules.filter(rule => rule.enabled);

  return (
    <VStack spacing={6} align="stretch" maxW="4xl" mx="auto" p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Notification Settings
        </Text>
        <Text color="gray.600">
          Configure how and when you receive alert notifications
        </Text>
      </Box>

      {/* General Settings */}
      <Box p={6} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          General Preferences
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Toast Notifications</FormLabel>
            <Switch
              isChecked={preferences.enableToasts}
              onChange={(e) => handlePreferenceChange("enableToasts", e.target.checked)}
            />
            <FormHelperText>
              Show popup notifications for alerts
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Sound Alerts</FormLabel>
            <Switch
              isChecked={preferences.enableSounds}
              onChange={(e) => handlePreferenceChange("enableSounds", e.target.checked)}
            />
            <FormHelperText>
              Play sounds for critical alerts
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Desktop Notifications</FormLabel>
            <Switch
              isChecked={preferences.enableDesktopNotifications}
              onChange={(e) => handlePreferenceChange("enableDesktopNotifications", e.target.checked)}
            />
            <FormHelperText>
              Show browser desktop notifications
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Show All Notifications</FormLabel>
            <Switch
              isChecked={preferences.showAllNotifications}
              onChange={(e) => handlePreferenceChange("showAllNotifications", e.target.checked)}
            />
            <FormHelperText>
              Show info and warning alerts (not just errors)
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Toast Duration (seconds)</FormLabel>
            <NumberInput
              value={preferences.toastDuration}
              onChange={(_, value) => handlePreferenceChange("toastDuration", value || 5)}
              min={1}
              max={30}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              How long toasts stay visible (0 = permanent)
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Max Concurrent Toasts</FormLabel>
            <NumberInput
              value={preferences.maxConcurrentToasts}
              onChange={(_, value) => handlePreferenceChange("maxConcurrentToasts", value || 5)}
              min={1}
              max={20}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Maximum number of toasts shown at once
            </FormHelperText>
          </FormControl>
        </SimpleGrid>
      </Box>

      {/* Mute Rules */}
      <Box p={6} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.200">
        <HStack justify="space-between" mb={4}>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="lg" fontWeight="semibold">
              Mute Rules
            </Text>
            <Text fontSize="sm" color="gray.600">
              Create rules to automatically mute specific types of alerts
            </Text>
          </VStack>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreateRule}>
            Add Rule
          </Button>
        </HStack>

        {activeMuteRules.length > 0 && (
          <Alert status="info" mb={4}>
            <AlertIcon />
            <Text fontSize="sm">
              {activeMuteRules.length} active mute rule{activeMuteRules.length !== 1 ? "s" : ""} currently filtering notifications
            </Text>
          </Alert>
        )}

        <VStack spacing={3} align="stretch">
          {preferences.muteRules.length === 0 ? (
            <Box
              p={8}
              bg="gray.50"
              borderRadius="md"
              border="2px dashed"
              borderColor="gray.300"
              textAlign="center"
            >
              <FiVolumeX size={32} color="gray.400" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.600" mb={2}>
                No mute rules configured
              </Text>
              <Text fontSize="sm" color="gray.500">
                Create rules to automatically filter out unwanted notifications
              </Text>
            </Box>
          ) : (
            preferences.muteRules.map((rule) => (
              <Box
                key={rule.id}
                p={4}
                border="1px solid"
                borderColor={rule.enabled ? "gray.200" : "gray.100"}
                borderRadius="md"
                bg={rule.enabled ? "white" : "gray.50"}
                opacity={rule.enabled ? 1 : 0.7}
              >
                <HStack justify="space-between" align="flex-start">
                  <VStack align="flex-start" spacing={2} flex={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold">{rule.name}</Text>
                      <Badge colorScheme={rule.enabled ? "green" : "gray"}>
                        {rule.enabled ? "Active" : "Disabled"}
                      </Badge>
                      {rule.duration?.type === "temporary" && (
                        <Badge colorScheme="orange">
                          <HStack spacing={1}>
                            <FiClock size={12} />
                            <Text>Temporary</Text>
                          </HStack>
                        </Badge>
                      )}
                    </HStack>

                    {rule.description && (
                      <Text fontSize="sm" color="gray.600">
                        {rule.description}
                      </Text>
                    )}

                    <HStack spacing={4} fontSize="xs" color="gray.500">
                      {rule.conditions.severity && rule.conditions.severity.length > 0 && (
                        <Text>Severity: {rule.conditions.severity.join(", ")}</Text>
                      )}
                      {rule.conditions.type && rule.conditions.type.length > 0 && (
                        <Text>Types: {rule.conditions.type.join(", ")}</Text>
                      )}
                      {rule.conditions.timeRange?.start && rule.conditions.timeRange?.end && (
                        <Text>
                          Quiet hours: {rule.conditions.timeRange.start} - {rule.conditions.timeRange.end}
                        </Text>
                      )}
                    </HStack>
                  </VStack>

                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Edit rule"
                      icon={<FiEdit />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRule(rule)}
                    />
                    <IconButton
                      aria-label="Delete rule"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteRule(rule.id)}
                    />
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      </Box>

      {/* Current Settings Preview */}
      <Box p={6} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Current Configuration
        </Text>
        <Code display="block" whiteSpace="pre-wrap" p={4} fontSize="sm">
          {JSON.stringify(
            {
              notifications: {
                toasts: preferences.enableToasts,
                sounds: preferences.enableSounds,
                desktop: preferences.enableDesktopNotifications,
                showAll: preferences.showAllNotifications,
              },
              settings: {
                toastDuration: preferences.toastDuration,
                maxToasts: preferences.maxConcurrentToasts,
              },
              muteRules: {
                total: preferences.muteRules.length,
                active: activeMuteRules.length,
              },
            },
            null,
            2
          )}
        </Code>
      </Box>

      {/* Mute Rule Form Modal */}
      <MuteRuleForm
        rule={selectedRule}
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveRule}
      />
    </VStack>
  );
}
