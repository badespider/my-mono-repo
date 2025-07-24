import React from 'react';
import { 
  Monitor, 
  BarChart3, 
  RefreshCw, 
  Bell, 
  Play, 
  Square, 
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Agent, AgentType } from '../../types/agents';
import { useAgentStore } from '../../stores/agentStore';

interface AgentCardProps {
  agent: Agent;
  onControlPanel: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onControlPanel }) => {
  const { updateAgent } = useAgentStore();

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'monitoring':
        return Monitor;
      case 'analysis':
        return BarChart3;
      case 'rebalancing':
        return RefreshCw;
      case 'alerts':
        return Bell;
      default:
        return Monitor;
    }
  };

  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'monitoring':
        return 'blue';
      case 'analysis':
        return 'orange';
      case 'rebalancing':
        return 'purple';
      case 'alerts':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'error':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const toggleAgent = () => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    updateAgent(agent.id, { status: newStatus });
  };

  const Icon = getAgentIcon(agent.type);
  const color = getAgentColor(agent.type);
  const isStale = new Date().getTime() - agent.lastHeartbeat.getTime() > 30000; // 30 seconds

  return (
    <Card hover className="relative">
      <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <Badge variant="info" size="sm" className="mt-1">
              {agent.type}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {isStale ? (
            <WifiOff className="w-4 h-4 text-red-500" />
          ) : (
            <Wifi className="w-4 h-4 text-green-500" />
          )}
          <Badge variant={getStatusVariant(agent.status)} size="sm">
            {agent.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {agent.successRate}%
          </p>
          <p className="text-xs text-gray-500">Success Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {agent.executionCount}
          </p>
          <p className="text-xs text-gray-500">Executions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {agent.uptimeHours}h
          </p>
          <p className="text-xs text-gray-500">Uptime</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Last Heartbeat</p>
        <p className={`text-sm ${isStale ? 'text-red-600' : 'text-gray-700'}`}>
          {agent.lastHeartbeat.toLocaleTimeString()}
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={toggleAgent}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            agent.status === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {agent.status === 'active' ? (
            <>
              <Square className="w-4 h-4 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Start
            </>
          )}
        </button>
        
        <button
          onClick={() => onControlPanel(agent)}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

export default AgentCard;