import React from "react";

export default function PortfolioPage() {
  const cardStyle = {
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "16px",
  };

  const holdings = [
    { symbol: "SOL", amount: "42.5", value: "$4,250", change: "+12.5%" },
    { symbol: "RAY", amount: "150.0", value: "$1,875", change: "-5.2%" },
    { symbol: "ORCA", amount: "320.8", value: "$896", change: "+8.7%" },
    { symbol: "USDC", amount: "2,500", value: "$2,500", change: "0.0%" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          Portfolio Overview
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#3182ce",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>
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
            + Add Position
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Portfolio Summary
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "14px", color: "#718096" }}>Total Value</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>$9,521.00</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "#718096" }}>24h Change</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#48bb78" }}>+$425.60 (+4.7%)</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "#718096" }}>Holdings</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>4 Assets</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "#718096" }}>P&L</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#48bb78" }}>+$1,247.50</div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Current Holdings
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {holdings.map((holding, index) => (
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
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>{holding.symbol}</div>
                <div style={{ fontSize: "14px", color: "#718096" }}>{holding.amount} tokens</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "600" }}>{holding.value}</div>
                <div style={{ 
                  fontSize: "14px", 
                  color: holding.change.startsWith('+') ? "#48bb78" : holding.change.startsWith('-') ? "#f56565" : "#718096"
                }}>
                  {holding.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Portfolio Performance
        </h3>
        <div style={{ padding: "40px", backgroundColor: "#f7fafc", borderRadius: "6px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#718096" }}>
            📈 Performance charts and historical data will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
}
