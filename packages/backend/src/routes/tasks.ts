import { Router, Request, Response } from 'express';
import { HTTP_STATUS, ApiResponse } from '@org/shared';
import { tasksStore, addTask, findAgentById } from '../stores';
import { 
  CreateTaskRequest, 
  TasksQueryParams, 
  PaginatedTasksResponse,
  Task
} from '../types/workflow';

const router: Router = Router();

// GET /api/tasks - Get tasks with pagination and filtering
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      agentId,
      status,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    }: TasksQueryParams = req.query as any;

    // Convert page and limit to numbers
    const pageNum = Math.max(1, parseInt(page.toString(), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit.toString(), 10))); // Max 100 per page

    // Filter tasks
    let filteredTasks = [...tasksStore];

    if (agentId) {
      filteredTasks = filteredTasks.filter(task => task.agentId === agentId);
    }

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          const statusOrder = { running: 4, pending: 3, completed: 2, failed: 1 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Calculate pagination
    const totalTasks = filteredTasks.length;
    const totalPages = Math.ceil(totalTasks / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    const response: PaginatedTasksResponse = {
      tasks: paginatedTasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalTasks,
        totalPages,
      },
    };

    res.json({
      success: true,
      data: response,
    } as ApiResponse<PaginatedTasksResponse>);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch tasks',
    } as ApiResponse);
  }
});

// POST /api/tasks - Create new task (internal use by agents)
router.post('/', (req: Request, res: Response) => {
  try {
    const taskData: CreateTaskRequest = req.body;

    // Validate required fields
    if (!taskData.agentId || !taskData.type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'agentId and type are required',
      } as ApiResponse);
    }

    // Validate agent exists
    const agent = findAgentById(taskData.agentId);
    if (!agent) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    // Validate priority if provided
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid priority. Must be one of: ' + validPriorities.join(', '),
      } as ApiResponse);
    }

    // Create task
    const newTask = addTask({
      agentId: taskData.agentId,
      type: taskData.type,
      status: 'pending',
      priority: taskData.priority || 'medium',
      metadata: taskData.metadata,
    });

    console.log(`📋 New task created: ${newTask.id} for agent ${taskData.agentId}`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: newTask,
      message: 'Task created successfully',
    } as ApiResponse<Task>);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to create task',
    } as ApiResponse);
  }
});

// GET /api/tasks/stats - Get task statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      total: tasksStore.length,
      byStatus: {
        pending: tasksStore.filter(t => t.status === 'pending').length,
        running: tasksStore.filter(t => t.status === 'running').length,
        completed: tasksStore.filter(t => t.status === 'completed').length,
        failed: tasksStore.filter(t => t.status === 'failed').length,
      },
      byPriority: {
        low: tasksStore.filter(t => t.priority === 'low').length,
        medium: tasksStore.filter(t => t.priority === 'medium').length,
        high: tasksStore.filter(t => t.priority === 'high').length,
        critical: tasksStore.filter(t => t.priority === 'critical').length,
      },
      completionRate: tasksStore.length > 0 
        ? (tasksStore.filter(t => t.status === 'completed').length / tasksStore.length) * 100
        : 0,
      averageExecutionTime: tasksStore
        .filter(t => t.executionTime)
        .reduce((sum, t) => sum + (t.executionTime || 0), 0) / 
        Math.max(1, tasksStore.filter(t => t.executionTime).length),
    };

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch task statistics',
    } as ApiResponse);
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = tasksStore.find(t => t.id === id);

    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Task not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: task,
    } as ApiResponse<Task>);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch task',
    } as ApiResponse);
  }
});

export { router as tasksRouter };
