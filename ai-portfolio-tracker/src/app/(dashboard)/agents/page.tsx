import React from "react";

export default function AgentsPage() {
  const cardStyle = {
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "16px",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#48bb78";
      case "inactive": return "#718096";
      case "error": return "#f56565";
      case "maintenance": return "#ed8936";
      default: return "#718096";
    }
  };

  const agents = [
    { name: "Portfolio Monitor", status: "active", description: "Monitors portfolio performance and asset price movements" },
    { name: "Risk Analyzer", status: "active", description: "Analyzes portfolio risk metrics and correlation patterns" },
    { name: "Auto Rebalancer", status: "inactive", description: "Automatically rebalances portfolio when allocation drifts" },
    { name: "Alert Manager", status: "active", description: "Manages price alerts and system notifications" },
    { name: "Performance Tracker", status: "error", description: "Tracks portfolio performance metrics" },
    { name: "DeFi Monitor", status: "maintenance", description: "Monitors DeFi protocol interactions" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "32px" }}>
        AI Agents
      </h1>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Agent Management
        </h2>
        <p style={{ color: "#718096", marginBottom: "16px" }}>
          This page will contain AI agent configuration and management tools.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Create Agent
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#3182ce",
              border: "1px solid #3182ce",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            View All Agents
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Active Agents
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {agents.map((agent, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              backgroundColor: "#f7fafc"
            }}>
              <div>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>{agent.name}</div>
                <div style={{ fontSize: "14px", color: "#718096" }}>{agent.description}</div>
              </div>
              <div style={{
                padding: "4px 12px",
                borderRadius: "12px",
                backgroundColor: getStatusColor(agent.status),
                color: "white",
                fontSize: "12px",
                fontWeight: "500",
                textTransform: "capitalize"
              }}>
                {agent.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
