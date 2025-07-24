"use client";

import React from "react";
import {
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Box,
} from "@chakra-ui/react";
import { FiBell, FiX } from "react-icons/fi";

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialAlertId?: string;
}

export function AlertDrawer({ isOpen, onClose }: AlertDrawerProps) {
  if (!isOpen) return null;

  // Mock alert data for demonstration
  const mockAlerts = [
    {
      id: "1",
      title: "Portfolio Alert",
      message: "Your portfolio has experienced a 5% change",
      severity: "warning",
      type: "portfolio",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2", 
      title: "Price Alert",
      message: "SOL price has reached your target",
      severity: "info",
      type: "price",
      timestamp: new Date().toISOString(),
    },
  ];

  return (
    <Box
      position="fixed"
      right={0}
      top={0}
      h="100vh"
      w="400px"
      bg="white"
      boxShadow="lg"
      p={6}
      zIndex={1000}
      borderLeft="1px solid"
      borderColor="gray.200"
    >
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <FiBell />
            <Text fontSize="lg" fontWeight="bold">
              Alert Center
            </Text>
          </HStack>
          <Button onClick={onClose} variant="ghost" size="sm">
            <FiX />
          </Button>
        </HStack>

        {/* Alert List */}
        <VStack spacing={3} align="stretch">
          {mockAlerts.map((alert) => (
            <Box
              key={alert.id}
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="gray.50"
            >
              <VStack align="flex-start" spacing={2}>
                <HStack>
                  <Badge 
                    colorScheme={alert.severity === "warning" ? "yellow" : "blue"}
                  >
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">
                    {alert.type}
                  </Badge>
                </HStack>
                <Text fontWeight="semibold" fontSize="sm">
                  {alert.title}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {alert.message}
                </Text>
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Footer */}
        <Button onClick={onClose} variant="outline" mt={4}>
          Close
        </Button>
      </VStack>
    </Box>
  );
}
