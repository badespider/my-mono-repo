import React from "react";

export default function TasksPage() {
  const cardStyle = {
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "16px",
  };

  const tasks = [
    { name: "Rebalance DeFi Portfolio", status: "in-progress", priority: "high", agent: "Rebalancing Agent" },
    { name: "Monitor Jupiter Swap Opportunities", status: "completed", priority: "medium", agent: "Monitoring Agent" },
    { name: "Analyze Market Trends", status: "pending", priority: "low", agent: "Analysis Agent" },
    { name: "Risk Assessment", status: "completed", priority: "high", agent: "Risk Analyzer" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#48bb78";
      case "in-progress": return "#3182ce";
      case "pending": return "#ed8936";
      default: return "#718096";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#f56565";
      case "medium": return "#ed8936";
      case "low": return "#718096";
      default: return "#718096";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          AI Agent Tasks
        </h1>
        <button
          style={{
            backgroundColor: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          + Create Task
        </button>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Task Overview
        </h2>
        <p style={{ color: "#718096", marginBottom: "16px" }}>
          Monitor and manage automated tasks executed by AI agents.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
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
            View History
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
            Filter Tasks
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {tasks.map((task, index) => (
          <div key={index} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>{task.name}</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  backgroundColor: getPriorityColor(task.priority),
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "500",
                  textTransform: "uppercase"
                }}>
                  {task.priority}
                </span>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  backgroundColor: getStatusColor(task.status),
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "500",
                  textTransform: "capitalize"
                }}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#718096" }}>Assigned to: {task.agent}</span>
              <button
                style={{
                  backgroundColor: "transparent",
                  color: "#3182ce",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
