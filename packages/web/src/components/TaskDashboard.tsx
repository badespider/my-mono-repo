import { useState } from "react";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Pause,
  Play,
  MoreHorizontal,
  LayoutGrid,
  List
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
type AgentType = 'monitoring' | 'analysis' | 'rebalancing' | 'alerts';

interface Task {
  id: string;
  title: string;
  description: string;
  agent: AgentType;
  status: TaskStatus;
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const TaskDashboard = () => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [tasks] = useState<Task[]>([
    {
      id: 'PT-001',
      title: 'Portfolio Rebalancing',
      description: 'Automatic rebalancing based on risk threshold breach',
      agent: 'rebalancing',
      status: 'in-progress',
      progress: 67,
      startTime: new Date(Date.now() - 1800000),
      estimatedCompletion: new Date(Date.now() + 600000),
      priority: 'high'
    },
    {
      id: 'PT-002',
      title: 'Risk Analysis Update',
      description: 'Weekly comprehensive risk assessment',
      agent: 'analysis',
      status: 'in-progress',
      progress: 34,
      startTime: new Date(Date.now() - 900000),
      estimatedCompletion: new Date(Date.now() + 1200000),
      priority: 'medium'
    },
    {
      id: 'PT-003',
      title: 'Price Alert Monitoring',
      description: 'Monitor SOL price for threshold alerts',
      agent: 'alerts',
      status: 'done',
      progress: 100,
      startTime: new Date(Date.now() - 300000),
      priority: 'low'
    },
    {
      id: 'PT-004',
      title: 'Wallet Sync Verification',
      description: 'Verify wallet connection and transaction history',
      agent: 'monitoring',
      status: 'todo',
      progress: 0,
      startTime: new Date(),
      priority: 'critical'
    },
    {
      id: 'PT-005',
      title: 'Performance Report Generation',
      description: 'Generate monthly performance analytics',
      agent: 'analysis',
      status: 'review',
      progress: 90,
      startTime: new Date(Date.now() - 3600000),
      priority: 'medium'
    }
  ]);

  const getAgentColor = (agent: AgentType) => {
    const colors = {
      monitoring: 'agent-monitoring',
      analysis: 'agent-analysis',
      rebalancing: 'agent-rebalancing',
      alerts: 'agent-alerts'
    };
    return colors[agent];
  };

  const getStatusBadge = (status: TaskStatus) => {
    const config = {
      backlog: { variant: 'secondary', label: 'Backlog', color: 'bg-status-inactive' },
      todo: { variant: 'outline', label: 'To Do', color: 'bg-blue-500' },
      'in-progress': { variant: 'default', label: 'In Progress', color: 'bg-primary' },
      review: { variant: 'outline', label: 'Review', color: 'bg-status-warning' },
      done: { variant: 'default', label: 'Done', color: 'bg-status-success' },
      blocked: { variant: 'destructive', label: 'Blocked', color: 'bg-status-error' }
    } as const;

    const { variant, label, color } = config[status];
    
    return (
      <Badge variant={variant} className="text-xs">
        <div className={`w-2 h-2 rounded-full ${color} mr-1`}></div>
        {label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'text-status-inactive',
      medium: 'text-status-warning',
      high: 'text-status-error',
      critical: 'text-status-error'
    };
    return colors[priority];
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  const formatETA = (date?: Date) => {
    if (!date) return 'N/A';
    const diff = date.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes <= 0) return 'Completing...';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const statusGroups = {
    backlog: tasks.filter(t => t.status === 'backlog'),
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
    blocked: tasks.filter(t => t.status === 'blocked')
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Tasks Dashboard</h2>
          <p className="text-muted-foreground">Real-time task execution and progress tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} className="space-y-4">
        <TabsContent value="table">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Task Execution Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-mono text-muted-foreground">{task.id}</span>
                        <div className={`w-3 h-3 rounded-full bg-${getAgentColor(task.agent)}`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)} capitalize`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                        
                        {task.status === 'in-progress' && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{task.progress}% complete</span>
                              <span>ETA: {formatETA(task.estimatedCompletion)}</span>
                            </div>
                            <Progress value={task.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Started</div>
                          <div className="text-xs text-foreground">{formatTimeAgo(task.startTime)}</div>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="ml-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statusGroups).map(([status, statusTasks]) => (
              <Card key={status} className="bg-gradient-card border-border shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status.replace('-', ' ')}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {statusTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                        <div className={`w-2 h-2 rounded-full bg-${getAgentColor(task.agent)}`}></div>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1 truncate">
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      {task.status === 'in-progress' && (
                        <Progress value={task.progress} className="h-1 mb-2" />
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${getPriorityColor(task.priority)} capitalize`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(task.startTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskDashboard;