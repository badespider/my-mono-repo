"use client";

import React from "react";
import { Box, VStack, Text, Icon, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCheckSquare,
  FiBriefcase,
  FiSettings,
  FiActivity,
} from "react-icons/fi";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Agents", href: "/agents", icon: FiActivity },
  { name: "Tasks", href: "/tasks", icon: FiCheckSquare },
  { name: "Portfolio", href: "/portfolio", icon: FiBriefcase },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Box h="full" overflow="auto">
      {/* Logo/Brand */}
      <Box p={6} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="xl" fontWeight="bold" color="gray.900">
          AI Portfolio
        </Text>
        <Text fontSize="sm" color="gray.500">
          Tracker
        </Text>
      </Box>

      {/* Navigation */}
      <VStack spacing={1} align="stretch" p={4}>
        {navItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <ChakraLink
              key={item.name}
              as={Link}
              href={item.href}
              onClick={onItemClick}
              _hover={{ textDecoration: "none" }}
            >
              <Box
                display="flex"
                alignItems="center"
                p={3}
                borderRadius="md"
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.600" : "gray.700"}
                _hover={{ bg: isActive ? "blue.50" : "gray.50" }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Icon as={item.icon} mr={3} boxSize={5} />
                <Text fontWeight={isActive ? "semibold" : "normal"}>
                  {item.name}
                </Text>
              </Box>
            </ChakraLink>
          );
        })}
      </VStack>
    </Box>
  );
}
