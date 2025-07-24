import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import AgentCard from '../components/dashboard/AgentCard';
import TasksTable from '../components/dashboard/TasksTable';
import HoldingsTable from '../components/dashboard/HoldingsTable';
import AgentControlPanel from '../components/modals/AgentControlPanel';
import { useAgentStore } from '../stores/agentStore';
import { usePortfolioStore } from '../stores/portfolioStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { Agent, Portfolio, Task, Alert } from '../types/agents';

const Dashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showControlPanel, setShowControlPanel] = useState(false);
  
  const { agents, setAgents, setTasks, addAlert } = useAgentStore();
  const { setPortfolio, setWalletConnection } = usePortfolioStore();
  
  // Initialize WebSocket connection
  useWebSocket('ws://localhost:8080');

  // Mock data initialization
  useEffect(() => {
    // Mock agents
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'Portfolio Monitor',
        type: 'monitoring',
        status: 'active',
        successRate: 98.5,
        executionCount: 1247,
        uptimeHours: 72,
        lastHeartbeat: new Date(),
        metrics: { cpu: 45, memory: 62, latency: 120 },
        config: {},
      },
      {
        id: 'agent-2',
        name: 'Risk Analyzer',
        type: 'analysis',
        status: 'active',
        successRate: 94.2,
        executionCount: 892,
        uptimeHours: 68,
        lastHeartbeat: new Date(),
        metrics: { cpu: 78, memory: 55, latency: 95 },
        config: {},
      },
      {
        id: 'agent-3',
        name: 'Auto Rebalancer',
        type: 'rebalancing',
        status: 'inactive',
        successRate: 89.7,
        executionCount: 156,
        uptimeHours: 24,
        lastHeartbeat: new Date(Date.now() - 45000),
        metrics: { cpu: 23, memory: 41, latency: 200 },
        config: {},
      },
      {
        id: 'agent-4',
        name: 'Alert Manager',
        type: 'alerts',
        status: 'active',
        successRate: 99.1,
        executionCount: 2341,
        uptimeHours: 96,
        lastHeartbeat: new Date(),
        metrics: { cpu: 12, memory: 28, latency: 45 },
        config: {},
      },
    ];

    // Mock tasks
    const mockTasks: Task[] = [
      {
        id: 'PT-001',
        agentId: 'agent-1',
        agentType: 'monitoring',
        description: 'Monitor SOL price movements',
        status: 'in-progress',
        progress: 75,
        startTime: new Date(Date.now() - 300000),
        priority: 'high',
      },
      {
        id: 'PT-002',
        agentId: 'agent-2',
        agentType: 'analysis',
        description: 'Analyze portfolio risk metrics',
        status: 'done',
        progress: 100,
        startTime: new Date(Date.now() - 600000),
        priority: 'medium',
      },
      {
        id: 'PT-003',
        agentId: 'agent-3',
        agentType: 'rebalancing',
        description: 'Rebalance USDC allocation',
        status: 'blocked',
        progress: 30,
        startTime: new Date(Date.now() - 900000),
        priority: 'critical',
      },
    ];

    // Mock portfolio
    const mockPortfolio: Portfolio = {
      totalValue: 125430.50,
      change24h: 2.34,
      unrealizedPnL: 8234.12,
      activePositions: 8,
      holdings: [
        {
          symbol: 'SOL',
          name: 'Solana',
          logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
          quantity: 450,
          currentPrice: 98.45,
          change24h: 3.2,
          allocation: 35.2,
          targetAllocation: 30.0,
          unrealizedPnL: 2341.50,
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          quantity: 25000,
          currentPrice: 1.00,
          change24h: 0.01,
          allocation: 19.9,
          targetAllocation: 25.0,
          unrealizedPnL: 12.50,
        },
        {
          symbol: 'RAY',
          name: 'Raydium',
          logo: 'https://cryptologos.cc/logos/raydium-ray-logo.png',
          quantity: 1200,
          currentPrice: 1.85,
          change24h: -1.8,
          allocation: 1.8,
          targetAllocation: 5.0,
          unrealizedPnL: -234.60,
        },
      ],
    };

    // Mock alerts
    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'High Portfolio Volatility',
        message: 'Portfolio volatility has increased by 15% in the last hour',
        timestamp: new Date(Date.now() - 120000),
        read: false,
        agentId: 'agent-2',
      },
      {
        id: 'alert-2',
        type: 'critical',
        title: 'Rebalancing Agent Offline',
        message: 'Auto Rebalancer has been offline for 45 minutes',
        timestamp: new Date(Date.now() - 2700000),
        read: false,
        agentId: 'agent-3',
      },
    ];

    setAgents(mockAgents);
    setTasks(mockTasks);
    setPortfolio(mockPortfolio);
    setWalletConnection(true, 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0');
    
    mockAlerts.forEach(alert => addAlert(alert));
  }, [setAgents, setTasks, setPortfolio, setWalletConnection, addAlert]);

  const handleControlPanel = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowControlPanel(true);
  };

  const closeControlPanel = () => {
    setShowControlPanel(false);
    setSelectedAgent(null);
  };

  return (
    <div className="space-y-8">
      <Toaster />
      
      {/* Portfolio Summary */}
      <PortfolioSummary />

      {/* AI Agents Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Agents Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onControlPanel={handleControlPanel}
            />
          ))}
        </div>
      </div>

      {/* Tasks Dashboard */}
      <TasksTable />

      {/* Holdings Table */}
      <HoldingsTable />

      {/* Agent Control Panel Modal */}
      {selectedAgent && (
        <AgentControlPanel
          agent={selectedAgent}
          isOpen={showControlPanel}
          onClose={closeControlPanel}
        />
      )}
    </div>
  );
};

export default Dashboard;