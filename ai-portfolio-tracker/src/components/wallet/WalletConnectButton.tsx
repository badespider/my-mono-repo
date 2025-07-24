"use client";

import React, { useState, useEffect } from 'react';
import {
  Button,
} from '@chakra-ui/react';

export function WalletConnectButton() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by showing placeholder until hydrated
  if (!isHydrated) {
    return (
      <Button
        colorScheme="blue"
        size="sm"
        borderRadius="full"
        isDisabled
      >
        Connect Wallet
      </Button>
    );
  }

  // Simplified wallet button - can be enhanced later
  return (
    <Button
      colorScheme="blue"
      size="sm"
      borderRadius="full"
      onClick={() => console.log('Wallet connection functionality will be implemented')}
    >
      Connect Wallet
    </Button>
  );
}
