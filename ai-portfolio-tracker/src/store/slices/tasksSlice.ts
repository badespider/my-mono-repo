import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TaskProgress {
  currentStep: number;
  totalSteps: number;
  stepDescription: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface Task {
  id: string;
  type: "monitor" | "analyze" | "rebalance" | "alert";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  agentId: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  updatedAt: number;
  title: string;
  description?: string;
  progress: TaskProgress;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  parameters?: Record<string, any>;
  dependencies?: string[];
}

interface TasksState {
  byId: Record<string, Task>;
  allIds: string[];
  queueIds: string[]; // pending and running tasks
  historyIds: string[]; // completed, failed, cancelled tasks
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  byId: {},
  allIds: [],
  queueIds: [],
  historyIds: [],
  loading: false,
  error: null,
};

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      const task = action.payload;
      state.byId[task.id] = task;
      if (!state.allIds.includes(task.id)) {
        state.allIds.push(task.id);
      }

      // Add to appropriate queue
      if (["pending", "running"].includes(task.status)) {
        if (!state.queueIds.includes(task.id)) {
          state.queueIds.push(task.id);
        }
      } else {
        if (!state.historyIds.includes(task.id)) {
          state.historyIds.unshift(task.id); // Add to beginning for recent-first order
        }
      }
    },
    updateTask: (
      state,
      action: PayloadAction<Partial<Task> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        const oldStatus = state.byId[id].status;
        state.byId[id] = {
          ...state.byId[id],
          ...updates,
          updatedAt: Date.now(),
        };

        // Move between queues if status changed
        const newStatus = state.byId[id].status;
        if (oldStatus !== newStatus) {
          // Remove from old queue
          if (["pending", "running"].includes(oldStatus)) {
            state.queueIds = state.queueIds.filter(taskId => taskId !== id);
          } else {
            state.historyIds = state.historyIds.filter(taskId => taskId !== id);
          }

          // Add to new queue
          if (["pending", "running"].includes(newStatus)) {
            state.queueIds.push(id);
          } else {
            state.historyIds.unshift(id);
          }
        }
      }
    },
    updateTaskProgress: (
      state,
      action: PayloadAction<{ id: string; progress: Partial<TaskProgress> }>
    ) => {
      const { id, progress } = action.payload;
      if (state.byId[id]) {
        state.byId[id].progress = { ...state.byId[id].progress, ...progress };
        state.byId[id].updatedAt = Date.now();
      }
    },
    startTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = "running";
        state.byId[id].startedAt = Date.now();
        state.byId[id].updatedAt = Date.now();
      }
    },
    completeTask: (
      state,
      action: PayloadAction<{ id: string; result?: any }>
    ) => {
      const { id, result } = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = "completed";
        state.byId[id].completedAt = Date.now();
        state.byId[id].updatedAt = Date.now();
        state.byId[id].progress.percentage = 100;
        if (result) {
          state.byId[id].result = result;
        }

        // Move from queue to history
        state.queueIds = state.queueIds.filter(taskId => taskId !== id);
        state.historyIds.unshift(id);
      }
    },
    failTask: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const { id, error } = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = "failed";
        state.byId[id].completedAt = Date.now();
        state.byId[id].updatedAt = Date.now();
        state.byId[id].error = error;

        // Move from queue to history
        state.queueIds = state.queueIds.filter(taskId => taskId !== id);
        state.historyIds.unshift(id);
      }
    },
    retryTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (
        state.byId[id] &&
        state.byId[id].retryCount < state.byId[id].maxRetries
      ) {
        state.byId[id].status = "pending";
        state.byId[id].retryCount += 1;
        state.byId[id].updatedAt = Date.now();
        state.byId[id].progress = {
          currentStep: 0,
          totalSteps: state.byId[id].progress.totalSteps,
          stepDescription: "Retrying...",
          percentage: 0,
        };
        delete state.byId[id].error;
        delete state.byId[id].startedAt;
        delete state.byId[id].completedAt;

        // Move from history to queue
        state.historyIds = state.historyIds.filter(taskId => taskId !== id);
        state.queueIds.push(id);
      }
    },
    cancelTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = "cancelled";
        state.byId[id].completedAt = Date.now();
        state.byId[id].updatedAt = Date.now();

        // Move from queue to history
        state.queueIds = state.queueIds.filter(taskId => taskId !== id);
        state.historyIds.unshift(id);
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter(taskId => taskId !== id);
      state.queueIds = state.queueIds.filter(taskId => taskId !== id);
      state.historyIds = state.historyIds.filter(taskId => taskId !== id);
    },
    clearTasks: (
      state,
      action: PayloadAction<"all" | "history" | "completed" | "failed">
    ) => {
      const type = action.payload;

      if (type === "all") {
        state.byId = {};
        state.allIds = [];
        state.queueIds = [];
        state.historyIds = [];
      } else if (type === "history") {
        state.historyIds.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(
          id => !state.historyIds.includes(id)
        );
        state.historyIds = [];
      } else {
        const idsToRemove = state.historyIds.filter(
          id => state.byId[id] && state.byId[id].status === type
        );
        idsToRemove.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(id => !idsToRemove.includes(id));
        state.historyIds = state.historyIds.filter(
          id => !idsToRemove.includes(id)
        );
      }
    },
  },
});

export const {
  setLoading,
  setError,
  addTask,
  updateTask,
  updateTaskProgress,
  startTask,
  completeTask,
  failTask,
  retryTask,
  cancelTask,
  removeTask,
  clearTasks,
} = tasksSlice.actions;
