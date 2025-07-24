import { Router, Request, Response } from 'express';
import { HTTP_STATUS, ApiResponse } from '@org/shared';
import { getWebSocketService } from '../services/websocket';
import { updateAgent, addTask, updateTask, findAgentById } from '../stores';

const router: Router = Router();

// GET /api/ws-test/status - Get WebSocket service status
router.get('/status', (req: Request, res: Response) => {
  try {
    const wsService = getWebSocketService();
    const clientCount = wsService.getClientCount();
    
    res.json({
      success: true,
      data: {
        isActive: true,
        connectedClients: clientCount,
        endpoint: '/ws',
      },
      message: `WebSocket service is running with ${clientCount} connected clients`,
    } as ApiResponse);
  } catch (error) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      error: 'WebSocket service not available',
    } as ApiResponse);
  }
});

// POST /api/ws-test/simulate-agent-update - Simulate an agent status change
router.post('/simulate-agent-update', (req: Request, res: Response) => {
  try {
    const { agentId, status } = req.body;
    
    if (!agentId || !status) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'agentId and status are required',
      } as ApiResponse);
    }

    const validStatuses = ['active', 'inactive', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      } as ApiResponse);
    }

    const agent = findAgentById(agentId);
    if (!agent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    // Update agent status (this will automatically broadcast via WebSocket)
    const updatedAgent = updateAgent(agentId, { status });

    res.json({
      success: true,
      data: updatedAgent,
      message: `Agent ${agentId} status updated to ${status} and broadcasted`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error simulating agent update:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to simulate agent update',
    } as ApiResponse);
  }
});

// POST /api/ws-test/simulate-task-creation - Simulate task creation
router.post('/simulate-task-creation', (req: Request, res: Response) => {
  try {
    const { agentId, type, priority = 'medium' } = req.body;
    
    if (!agentId || !type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'agentId and type are required',
      } as ApiResponse);
    }

    const agent = findAgentById(agentId);
    if (!agent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    // Create new task (this will automatically broadcast via WebSocket)
    const newTask = addTask({
      agentId,
      type,
      status: 'pending',
      priority,
      metadata: { simulatedAt: new Date().toISOString() },
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: newTask,
      message: `Task created for agent ${agentId} and broadcasted`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error simulating task creation:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to simulate task creation',
    } as ApiResponse);
  }
});

// POST /api/ws-test/simulate-task-update - Simulate task status update
router.post('/simulate-task-update', (req: Request, res: Response) => {
  try {
    const { taskId, status, result } = req.body;
    
    if (!taskId || !status) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'taskId and status are required',
      } as ApiResponse);
    }

    const validStatuses = ['pending', 'running', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      } as ApiResponse);
    }

    const updates: any = { status };
    
    if (status === 'completed' && result) {
      updates.result = result;
      updates.completedAt = new Date();
      updates.executionTime = Math.floor(Math.random() * 5000) + 1000; // Random execution time
    }

    if (status === 'failed' && req.body.error) {
      updates.error = req.body.error;
    }

    // Update task (this will automatically broadcast via WebSocket)
    const updatedTask = updateTask(taskId, updates);

    if (!updatedTask) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Task not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: updatedTask,
      message: `Task ${taskId} updated to ${status} and broadcasted`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error simulating task update:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to simulate task update',
    } as ApiResponse);
  }
});

// POST /api/ws-test/broadcast-custom - Broadcast custom message
router.post('/broadcast-custom', (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'type and data are required',
      } as ApiResponse);
    }

    const wsService = getWebSocketService();
    wsService.broadcastCustomMessage(type, data);

    res.json({
      success: true,
      message: `Custom message of type '${type}' broadcasted to all clients`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error broadcasting custom message:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to broadcast custom message',
    } as ApiResponse);
  }
});

export { router as websocketTestRouter };
