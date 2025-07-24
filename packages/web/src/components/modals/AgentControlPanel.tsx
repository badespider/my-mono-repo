import React, { useState } from 'react';
import { X, Activity, Monitor, FileText, Settings as SettingsIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Agent } from '../../types/agents';

interface AgentControlPanelProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({
  agent,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'logs' | 'config'>('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'monitoring', name: 'Monitoring', icon: Monitor },
    { id: 'logs', name: 'Logs', icon: FileText },
    { id: 'config', name: 'Configuration', icon: SettingsIcon },
  ];

  // Mock performance data
  const performanceData = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    latency: Math.random() * 200,
  }));

  // Mock logs
  const logs = [
    { level: 'info', message: 'Agent started successfully', timestamp: new Date() },
    { level: 'debug', message: 'Processing portfolio data...', timestamp: new Date() },
    { level: 'warning', message: 'High latency detected', timestamp: new Date() },
    { level: 'error', message: 'Failed to connect to price feed', timestamp: new Date() },
    { level: 'info', message: 'Rebalancing completed', timestamp: new Date() },
  ];

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'debug': return 'text-gray-500';
      default: return 'text-blue-600';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">{agent.successRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Error Rate</span>
              <span className="font-semibold text-red-600">{(100 - agent.successRate).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Latency</span>
              <span className="font-semibold text-blue-600">{agent.metrics.latency}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-semibold text-purple-600">{agent.uptimeHours}h</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CPU Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${agent.metrics.cpu}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{agent.metrics.cpu}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${agent.metrics.memory}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{agent.metrics.memory}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Agent Controls</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
            Start Agent
          </button>
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
            Stop Agent
          </button>
          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors">
            Restart Agent
          </button>
        </div>
      </Card>
    </div>
  );

  const MonitoringTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Real-time Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
              <Line type="monotone" dataKey="latency" stroke="#f59e0b" name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  const LogsTab = () => (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Live Logs</h3>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>All Levels</option>
              <option>Error</option>
              <option>Warning</option>
              <option>Info</option>
              <option>Debug</option>
            </select>
            <button className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200">
              Export
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-2">
              <span className="text-gray-400">
                [{log.timestamp.toLocaleTimeString()}]
              </span>
              <span className={`ml-2 font-semibold ${getLogColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const ConfigTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Agent Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Execution Interval (seconds)
            </label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              defaultValue="30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Threshold (%)
            </label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              defaultValue="5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Conditions
            </label>
            <textarea 
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
              defaultValue="portfolio_change > 10%&#10;latency > 1000ms"
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Save Configuration
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Reset to Default
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {agent.name} Control Panel
            </h2>
            <Badge variant={agent.status === 'active' ? 'success' : 'error'}>
              {agent.status}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'monitoring' && <MonitoringTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'config' && <ConfigTab />}
        </div>
      </div>
    </div>
  );
};

export default AgentControlPanel;