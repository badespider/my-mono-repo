"use client";

import React, { useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { HiMenu, HiX } from "react-icons/hi";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastManager } from "@/components/notifications/ToastManager";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Box minH="100vh" bg="gray.50">
        <Flex>
          {/* Sidebar - Desktop */}
          <Box
            display={{ base: "none", md: "block" }}
            w="240px"
            h="100vh"
            position="fixed"
            top="0"
            left="0"
            borderRight="1px"
            borderColor="gray.200"
            bg="white"
            zIndex="sticky"
          >
            <Sidebar />
          </Box>

          {/* Sidebar - Mobile */}
          <Box
            display={{ base: "block", md: "none" }}
            position="fixed"
            top="0"
            left="0"
            w="240px"
            h="100vh"
            bg="white"
            borderRight="1px"
            borderColor="gray.200"
            transform={isSidebarOpen ? "translateX(0)" : "translateX(-100%)"}
            transition="transform 0.3s ease-in-out"
            zIndex="overlay"
          >
            <Flex justify="flex-end" p={4}>
              <IconButton
                aria-label="Close menu"
                icon={<HiX />}
                onClick={toggleSidebar}
                variant="ghost"
                size="sm"
              />
            </Flex>
            <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
          </Box>

          {/* Main Content Area */}
          <Box flex="1" ml={{ base: 0, md: "240px" }}>
            {/* Header */}
            <Box
              position="sticky"
              top="0"
              bg="white"
              borderBottom="1px"
              borderColor="gray.200"
              zIndex="sticky"
            >
              <Header
                onMenuClick={toggleSidebar}
                isMobileMenuOpen={isSidebarOpen}
              />
            </Box>

            {/* Page Content */}
            <Box p={{ base: 4, md: 6 }} minH="calc(100vh - 80px)">
              {children}
            </Box>
          </Box>
        </Flex>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <Box
            display={{ base: "block", md: "none" }}
            position="fixed"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="blackAlpha.600"
            zIndex="modal"
            onClick={toggleSidebar}
          />
        )}
      </Box>
      
      {/* Toast Manager for real-time notifications */}
      <ToastManager />
    </>
  );
}
