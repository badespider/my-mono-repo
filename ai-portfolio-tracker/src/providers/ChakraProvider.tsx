"use client";

import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Temporarily disable ChakraProvider to isolate hydration issues
  return <>{children}</>;
}
