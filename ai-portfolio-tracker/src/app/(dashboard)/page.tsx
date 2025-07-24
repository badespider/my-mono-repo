import React from "react";

export default function DashboardPage() {
  const cardStyle = {
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  };

  return (
    <div>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "32px" }}>
        Portfolio Overview
      </h1>

      {/* Portfolio Stats */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#718096", marginBottom: "8px" }}>
            Total Portfolio Value
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            $12,450.32
          </div>
          <div style={{ color: "#48bb78", fontSize: "14px" }}>
            ↗ +23.36%
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#718096", marginBottom: "8px" }}>
            24h Change
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            +$1,230.45
          </div>
          <div style={{ color: "#48bb78", fontSize: "14px" }}>
            ↗ +10.92%
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#718096", marginBottom: "8px" }}>
            Active Positions
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            8
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Across 5 protocols
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#718096", marginBottom: "8px" }}>
            AI Agents Active
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            4
          </div>
          <div style={{ color: "#48bb78", fontSize: "14px" }}>
            All operational
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Recent Activity
        </h2>
        <p style={{ color: "#718096" }}>
          Recent portfolio activities and AI agent actions will be displayed
          here.
        </p>
      </div>
    </div>
  );
}
