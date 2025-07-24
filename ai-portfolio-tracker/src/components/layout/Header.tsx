"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Avatar,
  Badge,
  Text,
} from "@chakra-ui/react";
import { HiMenu, HiBell, HiSun, HiMoon } from "react-icons/hi";
import { useColorMode } from "@/components/ui/color-mode";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { AlertDrawer } from "@/components/notifications/AlertDrawer";
import { useAlertStore } from "@/stores/alertStore";

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const { colorMode, toggleColorMode, isHydrated } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const { getAlertsCount } = useAlertStore();
  const [alertIdToHighlight, setAlertIdToHighlight] = useState<string | undefined>();

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const alertCounts = getAlertsCount();
  const hasUnreadAlerts = alertCounts.unread > 0;
  const hasCriticalAlerts = alertCounts.critical > 0;

  // Listen for alert drawer open events from toast notifications
  React.useEffect(() => {
    const handleOpenDrawer = (event: CustomEvent) => {
      setAlertIdToHighlight(event.detail?.alertId);
      onOpen();
    };

    window.addEventListener("openAlertDrawer", handleOpenDrawer as EventListener);
    return () => {
      window.removeEventListener("openAlertDrawer", handleOpenDrawer as EventListener);
    };
  }, [onOpen]);

  const handleBellClick = () => {
    setAlertIdToHighlight(undefined);
    onOpen();
  };

  return (
    <>
      <Box
        bg="white"
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Flex justify="space-between" align="center">
          {/* Left side - Mobile menu button */}
          <HStack spacing={4}>
            <IconButton
              display={{ base: "block", md: "none" }}
              aria-label="Open menu"
              icon={<HiMenu />}
              onClick={onMenuClick}
              variant="ghost"
              size="sm"
            />

            {/* Page title or breadcrumb could go here */}
            <Text
              display={{ base: "none", md: "block" }}
              fontSize="lg"
              fontWeight="semibold"
            >
              Dashboard
            </Text>
          </HStack>

          {/* Right side - Actions */}
          <HStack spacing={3}>
            {/* Theme toggle */}
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === "light" ? <HiMoon /> : <HiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />

            {/* Notifications */}
            <Box position="relative">
              <IconButton
                aria-label="Notifications"
                icon={<HiBell />}
                variant="ghost"
                size="sm"
                onClick={handleBellClick}
                color={hasCriticalAlerts ? "red.500" : hasUnreadAlerts ? "blue.500" : "gray.500"}
                _hover={{
                  color: hasCriticalAlerts ? "red.600" : hasUnreadAlerts ? "blue.600" : "gray.600",
                  bg: hasCriticalAlerts ? "red.50" : hasUnreadAlerts ? "blue.50" : "gray.50",
                }}
              />
              {hasUnreadAlerts && (
                <Badge
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  colorScheme={hasCriticalAlerts ? "red" : "blue"}
                  borderRadius="full"
                  boxSize="18px"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={hasCriticalAlerts ? "pulse 2s infinite" : undefined}
                >
                  {alertCounts.unread > 99 ? "99+" : alertCounts.unread}
                </Badge>
              )}
            </Box>

            {/* Wallet Connect Button */}
            <WalletConnectButton />
          </HStack>
        </Flex>
      </Box>

      {/* Alert Drawer */}
      <AlertDrawer 
        isOpen={isOpen} 
        onClose={onClose} 
        initialAlertId={alertIdToHighlight}
      />
    </>
  );
}
