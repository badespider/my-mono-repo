import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentStatusGrid from "@/components/AgentStatusGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Activity,
  Cpu,
  MemoryStick,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

const Agents = () => {
  // Mock data for detailed agent monitoring
  const agentMetrics = {
    'mon-001': {
      cpu: 34,
      memory: 67,
      latency: 45,
      errorRate: 0.3,
      throughput: 156,
      logs: [
        { time: '14:32:15', level: 'INFO', message: 'Portfolio sync completed successfully' },
        { time: '14:31:58', level: 'INFO', message: 'Monitoring 8 wallet addresses' },
        { time: '14:31:42', level: 'WARN', message: 'High transaction volume detected' },
        { time: '14:31:25', level: 'INFO', message: 'Price feed updated for SOL' },
        { time: '14:31:08', level: 'INFO', message: 'Balance check completed' }
      ]
    },
    'ana-001': {
      cpu: 78,
      memory: 43,
      latency: 23,
      errorRate: 1.2,
      throughput: 89,
      logs: [
        { time: '14:32:01', level: 'INFO', message: 'Risk analysis completed for portfolio' },
        { time: '14:31:44', level: 'WARN', message: 'High volatility detected in RAY' },
        { time: '14:31:28', level: 'INFO', message: 'Correlation analysis updated' },
        { time: '14:31:12', level: 'ERROR', message: 'Failed to fetch market data for ORCA' },
        { time: '14:30:55', level: 'INFO', message: 'VaR calculation completed' }
      ]
    }
  };

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Agents Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents Management</h1>
            <p className="text-muted-foreground">Monitor and control autonomous trading agents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              Restart All
            </Button>
            <Button variant="agent" size="sm">
              Deploy New Agent
            </Button>
          </div>
        </div>

        {/* Agent Status Grid */}
        <AgentStatusGrid />

        {/* Detailed Agent Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health Overview */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CPU Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-agent-monitoring" />
                    <span className="text-sm font-medium text-foreground">CPU Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">56%</span>
                </div>
                <Progress value={56} className="h-2" />
              </div>

              {/* Memory Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-agent-analysis" />
                    <span className="text-sm font-medium text-foreground">Memory Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>

              {/* Network Latency */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-agent-rebalancing" />
                    <span className="text-sm font-medium text-foreground">Network Latency</span>
                  </div>
                  <span className="text-sm text-muted-foreground">34ms</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>

              {/* System Status */}
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-status-success" />
                      <span className="text-lg font-bold text-status-success">3</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertTriangle className="h-4 w-4 text-status-warning" />
                      <span className="text-lg font-bold text-status-warning">1</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Maintenance</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="h-4 w-4 text-status-error" />
                      <span className="text-lg font-bold text-status-error">0</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Error</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance Metrics */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="monitoring" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="monitoring">Monitor</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="rebalancing">Rebalance</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="monitoring" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">99.2%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">1,847</div>
                      <div className="text-sm text-muted-foreground">Executions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">72h</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">45ms</div>
                      <div className="text-sm text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">97.8%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">423</div>
                      <div className="text-sm text-muted-foreground">Executions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">68h</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">23ms</div>
                      <div className="text-sm text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rebalancing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">95.4%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">89</div>
                      <div className="text-sm text-muted-foreground">Executions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">45h</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-status-warning">Maintenance</div>
                      <div className="text-sm text-muted-foreground">Status</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">100%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">2,341</div>
                      <div className="text-sm text-muted-foreground">Executions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">72h</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">8ms</div>
                      <div className="text-sm text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <Play className="h-5 w-5 mb-1" />
                <span className="text-xs">Start All</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Pause className="h-5 w-5 mb-1" />
                <span className="text-xs">Pause All</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <RotateCcw className="h-5 w-5 mb-1" />
                <span className="text-xs">Restart All</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Configure</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Agents;