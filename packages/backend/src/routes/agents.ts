import { Router, Request, Response } from 'express';
import { HTTP_STATUS, ApiResponse } from '@org/shared';
import { agentsStore, findAgentById, updateAgent } from '../stores';
import { UpdateAgentRequest } from '../types/workflow';

const router: Router = Router();

// GET /api/agents - Get all agents
router.get('/', (req: Request, res: Response) => {
  try {
    // Optional filtering by type or status
    const { type, status } = req.query;
    
    let filteredAgents = [...agentsStore];
    
    if (type && typeof type === 'string') {
      filteredAgents = filteredAgents.filter(agent => agent.type === type);
    }
    
    if (status && typeof status === 'string') {
      filteredAgents = filteredAgents.filter(agent => agent.status === status);
    }

    res.json({
      success: true,
      data: filteredAgents,
      count: filteredAgents.length,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch agents',
    } as ApiResponse);
  }
});

// GET /api/agents/:id - Get agent by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = findAgentById(id);

    if (!agent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: agent,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch agent',
    } as ApiResponse);
  }
});

// PUT /api/agents/:id - Update agent by ID
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateAgentRequest = req.body;

    // Validate that agent exists
    const existingAgent = findAgentById(id);
    if (!existingAgent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    // Validate update payload
    const allowedUpdates = ['name', 'description', 'config', 'status'];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid update fields. Allowed fields: ' + allowedUpdates.join(', '),
      } as ApiResponse);
    }

    // Validate status field if provided
    if (updates.status && !['active', 'inactive', 'error'].includes(updates.status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid status. Must be one of: active, inactive, error',
      } as ApiResponse);
    }

    // Perform update
    const updatedAgent = updateAgent(id, updates);

    if (!updatedAgent) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update agent',
      } as ApiResponse);
    }

    console.log(`📝 Agent ${id} updated:`, Object.keys(updates).join(', '));

    res.json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update agent',
    } as ApiResponse);
  }
});

// GET /api/agents/:id/performance - Get agent performance metrics
router.get('/:id/performance', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = findAgentById(id);

    if (!agent) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Agent not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        agentId: agent.id,
        agentName: agent.name,
        performance: agent.performance || {
          tasksCompleted: 0,
          successRate: 100,
          averageExecutionTime: 0,
        },
        lastRun: agent.lastRun,
        nextRun: agent.nextRun,
        uptime: agent.status === 'active' ? '100%' : '0%',
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch agent performance',
    } as ApiResponse);
  }
});

export { router as agentsRouter };
