import { 
  Eye, 
  BarChart3, 
  RefreshCw, 
  AlertCircle, 
  Play, 
  Pause, 
  Settings,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgents, useStartAgent, useStopAgent } from "@/hooks/useAgents";
import type { AgentType, AgentStatus } from "@/lib/types";

const AgentStatusGrid = () => {
  // Fetch agents data from API
  const { data: agents = [], isLoading, error } = useAgents();
  const startAgentMutation = useStartAgent();
  const stopAgentMutation = useStopAgent();

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Agents Status</h2>
            <p className="text-muted-foreground">Real-time monitoring of autonomous agents</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border shadow-card animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Agents Status</h2>
            <p className="text-muted-foreground text-red-500">Error loading agents data</p>
          </div>
        </div>
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load agents. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'monitoring': return Eye;
      case 'analysis': return BarChart3;
      case 'rebalancing': return RefreshCw;
      case 'alerts': return AlertCircle;
    }
  };

  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'monitoring': return 'agent-monitoring';
      case 'analysis': return 'agent-analysis';
      case 'rebalancing': return 'agent-rebalancing';
      case 'alerts': return 'agent-alerts';
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'active': return 'status-success';
      case 'stopped': return 'status-inactive';
      case 'error': return 'status-error';
      case 'maintenance': return 'status-warning';
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    const variants = {
      active: 'default',
      stopped: 'secondary',
      error: 'destructive',
      maintenance: 'outline'
    } as const;

    const labels = {
      active: 'Connected',
      stopped: 'Stopped',
      error: 'Error',
      maintenance: 'Maintenance'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const getHeartbeatStatus = (lastHeartbeat: Date) => {
    const diff = Date.now() - lastHeartbeat.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return { text: 'Just now', color: 'text-status-success', icon: Wifi };
    if (minutes < 5) return { text: `${minutes}m ago`, color: 'text-status-warning', icon: Wifi };
    return { text: `${minutes}m ago`, color: 'text-status-error', icon: WifiOff };
  };

  const toggleAgent = async (agent: any) => {
    try {
      if (agent.status === 'active') {
        await stopAgentMutation.mutateAsync(agent.id);
      } else {
        await startAgentMutation.mutateAsync(agent.id);
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error);
      // You could show a toast notification here
    }
  };

  const openControlPanel = (agentId: string) => {
    // Open agent control panel logic would go here
    console.log('Open control panel for:', agentId);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Agents Status</h2>
          <p className="text-muted-foreground">Real-time monitoring of autonomous agents</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-status-success rounded-full animate-pulse-glow"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => {
          const AgentIcon = getAgentIcon(agent.type);
          const heartbeatStatus = getHeartbeatStatus(agent.lastHeartbeat);
          const HeartbeatIcon = heartbeatStatus.icon;

          return (
            <Card 
              key={agent.id} 
              className={`
                bg-gradient-card border-border shadow-card hover:shadow-agent transition-all duration-300
                border-t-4 border-t-${getAgentColor(agent.type)} group
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-${getAgentColor(agent.type)}/10`}>
                      <AgentIcon className={`h-5 w-5 text-${getAgentColor(agent.type)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {agent.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.executionCount}</div>
                    <div className="text-xs text-muted-foreground">Executions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.uptimeHours}h</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>

                {/* Heartbeat Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last Heartbeat:</span>
                  <div className="flex items-center gap-1">
                    <HeartbeatIcon className={`h-3 w-3 ${heartbeatStatus.color}`} />
                    <span className={heartbeatStatus.color}>{heartbeatStatus.text}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => toggleAgent(agent)}
                    disabled={startAgentMutation.isPending || stopAgentMutation.isPending}
                  >
                    {agent.status === 'active' ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openControlPanel(agent.id)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStatusGrid;