import React, { useState } from 'react';
import { Clock, User, MoreHorizontal, Grid3X3, List } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { useAgentStore } from '../../stores/agentStore';
import { Task, TaskStatus } from '../../types/agents';

const TasksTable: React.FC = () => {
  const { tasks, agents } = useAgentStore();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'blocked':
        return 'error';
      case 'review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Task ID</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Agent</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Started</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span className="font-mono text-sm">{task.id}</span>
                  <span className={`ml-2 w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{getAgentName(task.agentId)}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-900">{task.description}</span>
              </td>
              <td className="py-3 px-4">
                <div className="w-24">
                  <ProgressBar 
                    progress={task.progress} 
                    showLabel 
                    animated={task.status === 'in-progress'}
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusVariant(task.status)} size="sm">
                  {task.status.replace('-', ' ')}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTimeAgo(task.startTime)}
                </div>
              </td>
              <td className="py-3 px-4">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const KanbanView = () => {
    const columns: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked'];
    
    return (
      <div className="grid grid-cols-6 gap-4">
        {columns.map((status) => {
          const columnTasks = tasks.filter(task => task.status === status);
          
          return (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 capitalize">
                  {status.replace('-', ' ')}
                </h3>
                <Badge variant="default" size="sm">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card key={task.id} padding="sm" className="cursor-pointer hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-gray-500">{task.id}</span>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{getAgentName(task.agentId)}</span>
                      <span>{formatTimeAgo(task.startTime)}</span>
                    </div>
                    
                    {task.status === 'in-progress' && (
                      <div className="mt-2">
                        <ProgressBar progress={task.progress} animated />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Live Tasks Dashboard</h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'kanban' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? <TableView /> : <KanbanView />}
    </Card>
  );
};

export default TasksTable;