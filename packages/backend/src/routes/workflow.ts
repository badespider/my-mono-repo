import { Router, Request, Response } from 'express';
import { HTTP_STATUS, ApiResponse } from '@org/shared';
import { 
  workflowConfig, 
  updateWorkflowConfig,
  agentsStore,
  updateAgent
} from '../stores';

const router: Router = Router();

// POST /api/workflow/start - Start the workflow
router.post('/start', (req: Request, res: Response) => {
  try {
    if (workflowConfig.isRunning) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Workflow is already running',
      } as ApiResponse);
    }

    // Update workflow config
    updateWorkflowConfig({
      isRunning: true,
      startedAt: new Date(),
      stoppedAt: undefined,
    });

    // Set all agents to active status
    agentsStore.forEach(agent => {
      updateAgent(agent.id, { status: 'active' });
    });

    console.log('🚀 Workflow started at', new Date().toISOString());

    res.json({
      success: true,
      data: {
        isRunning: true,
        startedAt: workflowConfig.startedAt,
        activeAgents: agentsStore.length,
      },
      message: 'Workflow started successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error starting workflow:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to start workflow',
    } as ApiResponse);
  }
});

// POST /api/workflow/stop - Stop the workflow
router.post('/stop', (req: Request, res: Response) => {
  try {
    if (!workflowConfig.isRunning) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Workflow is not running',
      } as ApiResponse);
    }

    // Update workflow config
    updateWorkflowConfig({
      isRunning: false,
      stoppedAt: new Date(),
    });

    // Set all agents to inactive status
    agentsStore.forEach(agent => {
      updateAgent(agent.id, { status: 'inactive' });
    });

    console.log('🛑 Workflow stopped at', new Date().toISOString());

    res.json({
      success: true,
      data: {
        isRunning: false,
        stoppedAt: workflowConfig.stoppedAt,
        runDuration: workflowConfig.startedAt 
          ? Date.now() - workflowConfig.startedAt.getTime()
          : 0,
      },
      message: 'Workflow stopped successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error stopping workflow:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to stop workflow',
    } as ApiResponse);
  }
});

// GET /api/workflow/status - Get workflow status
router.get('/status', (req: Request, res: Response) => {
  try {
    const activeAgents = agentsStore.filter(agent => agent.status === 'active').length;
    const inactiveAgents = agentsStore.filter(agent => agent.status === 'inactive').length;
    const errorAgents = agentsStore.filter(agent => agent.status === 'error').length;

    res.json({
      success: true,
      data: {
        isRunning: workflowConfig.isRunning,
        startedAt: workflowConfig.startedAt,
        stoppedAt: workflowConfig.stoppedAt,
        cycleInterval: workflowConfig.cycleInterval,
        maxConcurrentTasks: workflowConfig.maxConcurrentTasks,
        agents: {
          total: agentsStore.length,
          active: activeAgents,
          inactive: inactiveAgents,
          error: errorAgents,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to get workflow status',
    } as ApiResponse);
  }
});

export { router as workflowRouter };
