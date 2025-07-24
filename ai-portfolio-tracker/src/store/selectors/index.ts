import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { Agent } from "../slices/agentsSlice";
import { Task } from "../slices/tasksSlice";
import { Position } from "../slices/portfolioSlice";
import { Alert } from "../slices/alertsSlice";

// Base selectors
export const selectAgentsState = (state: RootState) => state.agents;
export const selectTasksState = (state: RootState) => state.tasks;
export const selectPortfolioState = (state: RootState) => state.portfolio;
export const selectAlertsState = (state: RootState) => state.alerts;

// Agent selectors
export const selectAllAgents = createSelector(
  [selectAgentsState],
  agentsState => agentsState.allIds.map(id => agentsState.byId[id])
);

export const selectAgentById = createSelector(
  [selectAgentsState, (state: RootState, agentId: string) => agentId],
  (agentsState, agentId) => agentsState.byId[agentId]
);

export const selectActiveAgents = createSelector([selectAllAgents], agents =>
  agents.filter(agent => agent.status === "active")
);

export const selectAgentsByType = createSelector(
  [selectAllAgents, (state: RootState, type: Agent["type"]) => type],
  (agents, type) => agents.filter(agent => agent.type === type)
);

export const selectAgentMetrics = createSelector([selectAllAgents], agents => {
  return agents.reduce(
    (acc, agent) => {
      acc[agent.id] = agent.metrics;
      return acc;
    },
    {} as Record<string, Agent["metrics"]>
  );
});

export const selectAgentsLoading = createSelector(
  [selectAgentsState],
  state => state.loading
);

// Task selectors
export const selectAllTasks = createSelector([selectTasksState], tasksState =>
  tasksState.allIds.map(id => tasksState.byId[id])
);

export const selectTaskById = createSelector(
  [selectTasksState, (state: RootState, taskId: string) => taskId],
  (tasksState, taskId) => tasksState.byId[taskId]
);

export const selectQueuedTasks = createSelector(
  [selectTasksState],
  tasksState => tasksState.queueIds.map(id => tasksState.byId[id])
);

export const selectTaskHistory = createSelector(
  [selectTasksState],
  tasksState => tasksState.historyIds.map(id => tasksState.byId[id])
);

export const selectTasksByAgent = createSelector(
  [selectAllTasks, (state: RootState, agentId: string) => agentId],
  (tasks, agentId) => tasks.filter(task => task.agentId === agentId)
);

export const selectTasksByStatus = createSelector(
  [selectAllTasks, (state: RootState, status: Task["status"]) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

export const selectRunningTasks = createSelector([selectAllTasks], tasks =>
  tasks.filter(task => task.status === "running")
);

export const selectTaskStats = createSelector([selectAllTasks], tasks => {
  const stats = {
    total: tasks.length,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  tasks.forEach(task => {
    stats[task.status]++;
  });

  return stats;
});

export const selectTasksLoading = createSelector(
  [selectTasksState],
  state => state.loading
);

// Portfolio selectors
export const selectAllPositions = createSelector(
  [selectPortfolioState],
  portfolioState =>
    portfolioState.positionIds.map(id => portfolioState.positions[id])
);

export const selectPositionById = createSelector(
  [selectPortfolioState, (state: RootState, positionId: string) => positionId],
  (portfolioState, positionId) => portfolioState.positions[positionId]
);

export const selectPortfolioTotals = createSelector(
  [selectPortfolioState],
  portfolioState => ({
    totalValue: portfolioState.totalValue,
    totalInvested: portfolioState.totalInvested,
    totalRealizedPnl: portfolioState.totalRealizedPnl,
    totalUnrealizedPnl: portfolioState.totalUnrealizedPnl,
    totalUnrealizedPnlPercent: portfolioState.totalUnrealizedPnlPercent,
    dailyChange: portfolioState.dailyChange,
    dailyChangePercent: portfolioState.dailyChangePercent,
    lastUpdated: portfolioState.lastUpdated,
  })
);

export const selectTopPositions = createSelector(
  [selectAllPositions, (state: RootState, limit: number = 5) => limit],
  (positions, limit) =>
    positions.sort((a, b) => b.value - a.value).slice(0, limit)
);

export const selectPositionsByPnL = createSelector(
  [selectAllPositions],
  positions => ({
    winners: positions
      .filter(pos => pos.unrealizedPnl > 0)
      .sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent),
    losers: positions
      .filter(pos => pos.unrealizedPnl < 0)
      .sort((a, b) => a.unrealizedPnlPercent - b.unrealizedPnlPercent),
  })
);

export const selectPortfolioAllocation = createSelector(
  [selectAllPositions],
  positions =>
    positions.map(position => ({
      symbol: position.symbol,
      weight: position.weight,
      value: position.value,
    }))
);

export const selectPnLHistory = createSelector(
  [selectPortfolioState],
  portfolioState => portfolioState.pnlHistory
);

export const selectRebalanceHistory = createSelector(
  [selectPortfolioState],
  portfolioState => portfolioState.rebalanceHistory
);

export const selectLastRebalance = createSelector(
  [selectPortfolioState],
  portfolioState => ({
    lastRebalancedAt: portfolioState.lastRebalancedAt,
    lastEvent: portfolioState.rebalanceHistory[0], // Most recent
  })
);

export const selectPortfolioLoading = createSelector(
  [selectPortfolioState],
  state => state.loading
);

// Alert selectors
export const selectAllAlerts = createSelector(
  [selectAlertsState],
  alertsState => alertsState.allIds.map(id => alertsState.byId[id])
);

export const selectAlertById = createSelector(
  [selectAlertsState, (state: RootState, alertId: string) => alertId],
  (alertsState, alertId) => alertsState.byId[alertId]
);

export const selectUnreadAlerts = createSelector(
  [selectAlertsState],
  alertsState => alertsState.unreadIds.map(id => alertsState.byId[id])
);

export const selectReadAlerts = createSelector(
  [selectAlertsState],
  alertsState => alertsState.readIds.map(id => alertsState.byId[id])
);

export const selectUnreadCount = createSelector(
  [selectAlertsState],
  alertsState => alertsState.unreadCount
);

export const selectAlertsByCategory = createSelector(
  [
    selectAllAlerts,
    (state: RootState, category: Alert["category"]) => category,
  ],
  (alerts, category) => alerts.filter(alert => alert.category === category)
);

export const selectAlertsByType = createSelector(
  [selectAllAlerts, (state: RootState, type: Alert["type"]) => type],
  (alerts, type) => alerts.filter(alert => alert.type === type)
);

export const selectAlertsByAgent = createSelector(
  [selectAllAlerts, (state: RootState, agentId: string) => agentId],
  (alerts, agentId) => alerts.filter(alert => alert.agentId === agentId)
);

export const selectRecentAlerts = createSelector(
  [selectAllAlerts, (state: RootState, limit: number = 10) => limit],
  (alerts, limit) => alerts.slice(0, limit)
);

export const selectCriticalAlerts = createSelector([selectAllAlerts], alerts =>
  alerts.filter(alert => alert.type === "error" && !alert.read)
);

export const selectAlertsLoading = createSelector(
  [selectAlertsState],
  state => state.loading
);

// Cross-domain selectors
export const selectDashboardData = createSelector(
  [
    selectPortfolioTotals,
    selectActiveAgents,
    selectRunningTasks,
    selectUnreadCount,
    selectCriticalAlerts,
  ],
  (
    portfolioTotals,
    activeAgents,
    runningTasks,
    unreadCount,
    criticalAlerts
  ) => ({
    portfolio: portfolioTotals,
    activeAgentsCount: activeAgents.length,
    runningTasksCount: runningTasks.length,
    unreadAlertsCount: unreadCount,
    criticalAlertsCount: criticalAlerts.length,
  })
);

export const selectAgentDashboard = createSelector(
  [selectAllAgents, selectTasksByStatus],
  (agents, getTasksByStatus) =>
    agents.map(agent => ({
      ...agent,
      activeTasks: getTasksByStatus(null as any, "running").filter(
        task => task.agentId === agent.id
      ).length,
      queuedTasks: getTasksByStatus(null as any, "pending").filter(
        task => task.agentId === agent.id
      ).length,
    }))
);

export const selectSystemHealth = createSelector(
  [selectActiveAgents, selectAllAgents, selectTaskStats, selectCriticalAlerts],
  (activeAgents, allAgents, taskStats, criticalAlerts) => ({
    agentsOnline: activeAgents.length,
    totalAgents: allAgents.length,
    agentHealthPercentage:
      allAgents.length > 0 ? (activeAgents.length / allAgents.length) * 100 : 0,
    taskSuccessRate:
      taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0,
    criticalIssues: criticalAlerts.length,
    overallHealth:
      criticalAlerts.length === 0 && activeAgents.length === allAgents.length
        ? "healthy"
        : criticalAlerts.length > 0
          ? "critical"
          : "warning",
  })
);
