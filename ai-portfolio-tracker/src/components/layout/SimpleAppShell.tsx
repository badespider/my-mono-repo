"use client";

import React, { useState, useEffect } from "react";

interface SimpleAppShellProps {
  children: React.ReactNode;
}

export function SimpleAppShell({ children }: SimpleAppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7fafc" }}>
      {/* Sidebar - Desktop */}
      <div
        style={{
          display: isDesktop ? "block" : "none",
          width: "240px",
          height: "100vh",
          position: "fixed",
          top: "0",
          left: "0",
          borderRight: "1px solid #e2e8f0",
          backgroundColor: "white",
          zIndex: 1000,
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1a202c" }}>
            AI Portfolio
          </div>
          <div style={{ fontSize: "14px", color: "#718096" }}>
            Tracker
          </div>
        </div>
        
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "8px" }}>
            <a 
              href="/" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "6px", 
                backgroundColor: "#ebf8ff", 
                color: "#2b6cb0", 
                textDecoration: "none" 
              }}
            >
              🏠 Dashboard
            </a>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <a 
              href="/agents" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "6px", 
                color: "#4a5568", 
                textDecoration: "none" 
              }}
            >
              🤖 Agents
            </a>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <a 
              href="/tasks" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "6px", 
                color: "#4a5568", 
                textDecoration: "none" 
              }}
            >
              ✅ Tasks
            </a>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <a 
              href="/portfolio" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "6px", 
                color: "#4a5568", 
                textDecoration: "none" 
              }}
            >
              💼 Portfolio
            </a>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <a 
              href="/settings" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "6px", 
                color: "#4a5568", 
                textDecoration: "none" 
              }}
            >
              ⚙️ Settings
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: isDesktop ? "240px" : "0" }}>
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: "0",
            backgroundColor: "white",
            borderBottom: "1px solid #e2e8f0",
            zIndex: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                style={{
                  display: !isDesktop ? "block" : "none",
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={toggleSidebar}
              >
                ☰
              </button>
              <h1 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Dashboard
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                🌙
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                🔔
              </button>
              <button
                style={{
                  backgroundColor: "#3182ce",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "24px", minHeight: "calc(100vh - 80px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
