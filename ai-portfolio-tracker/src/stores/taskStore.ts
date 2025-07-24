import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Task } from "../services/types/api";
import type {
  TaskStartedEvent,
  TaskFinishedEvent,
} from "../services/websocket";

export interface TaskState {
  tasks: Task[];
  runningTasks: Task[];
  completedTasks: Task[];
  failedTasks: Task[];
  taskQueue: Task[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  taskStarted: (event: TaskStartedEvent) => void;
  taskFinished: (event: TaskFinishedEvent) => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByAgent: (agentId: string) => Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];
  getTasksByType: (type: Task["type"]) => Task[];
  getTasksByPriority: (priority: Task["priority"]) => Task[];
  updateTaskProgress: (taskId: string, progress: number) => void;
}

// Sample tasks for testing
const sampleTasks: Task[] = [
  {
    id: "task-1",
    agentId: "agent-rebalancer",
    type: "rebalance",
    status: "completed",
    priority: "high",
    title: "Portfolio Rebalancing",
    description: "Rebalanced portfolio to target allocation",
    input: {
      portfolioId: "sample-portfolio-1",
      parameters: { targetAllocation: { SOL: 0.4, USDC: 0.3, RAY: 0.3 } },
    },
    output: {
      result: {
        trades: [
          {
            fromSymbol: "SOL",
            toSymbol: "USDC",
            amount: 10,
            value: 1666.7,
          },
        ],
      },
      metadata: {
        executionTime: 5000,
        resourcesUsed: {},
      },
    },
    progress: 100,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    retryCount: 0,
    maxRetries: 3,
    executionTime: 5000,
  },
  {
    id: "task-2",
    agentId: "agent-analyzer",
    type: "analysis",
    status: "completed",
    priority: "medium",
    title: "Portfolio Analysis",
    description: "Analyzed portfolio risk and performance",
    input: {
      portfolioId: "sample-portfolio-1",
      parameters: { analysisType: "risk" },
    },
    output: {
      result: {
        summary: "Portfolio risk level: Moderate. Diversification score: 7.5/10",
      },
      metadata: {
        executionTime: 3000,
        resourcesUsed: {},
      },
    },
    progress: 100,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    retryCount: 0,
    maxRetries: 3,
    executionTime: 3000,
  },
];

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: sampleTasks,
        runningTasks: sampleTasks.filter(task => task.status === "running"),
        completedTasks: sampleTasks.filter(task => task.status === "completed"),
        failedTasks: sampleTasks.filter(task => task.status === "failed"),
        taskQueue: sampleTasks.filter(task => task.status === "pending"),
        isLoading: false,
        error: null,
        lastUpdate: null,

        setTasks: tasks => {
          set({
            tasks,
            runningTasks: tasks.filter(task => task.status === "running"),
            completedTasks: tasks.filter(task => task.status === "completed"),
            failedTasks: tasks.filter(task => task.status === "failed"),
            taskQueue: tasks.filter(task => task.status === "pending"),
            lastUpdate: new Date().toISOString(),
          });
        },

        updateTask: (id, updates) => {
          set(state => {
            const updatedTasks = state.tasks.map(task =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
            );

            return {
              tasks: updatedTasks,
              runningTasks: updatedTasks.filter(
                task => task.status === "running"
              ),
              completedTasks: updatedTasks.filter(
                task => task.status === "completed"
              ),
              failedTasks: updatedTasks.filter(
                task => task.status === "failed"
              ),
              taskQueue: updatedTasks.filter(task => task.status === "pending"),
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        taskStarted: (event: TaskStartedEvent) => {
          set(state => {
            const existingTaskIndex = state.tasks.findIndex(
              task => task.id === event.taskId
            );
            let updatedTasks: Task[];

            if (existingTaskIndex >= 0) {
              // Update existing task
              updatedTasks = state.tasks.map(task =>
                task.id === event.taskId
                  ? {
                      ...task,
                      status: "running" as const,
                      startedAt: event.timestamp,
                      updatedAt: event.timestamp,
                    }
                  : task
              );
            } else {
              // Create new task from event (minimal task object)
              const newTask: Task = {
                id: event.taskId,
                agentId: event.agentId,
                type: event.type,
                status: "running",
                priority: event.priority,
                title: event.title,
                description: "",
                input: { parameters: {} },
                progress: 0,
                createdAt: event.timestamp,
                updatedAt: event.timestamp,
                startedAt: event.timestamp,
                retryCount: 0,
                maxRetries: 3,
              };
              updatedTasks = [...state.tasks, newTask];
            }

            return {
              tasks: updatedTasks,
              runningTasks: updatedTasks.filter(
                task => task.status === "running"
              ),
              completedTasks: updatedTasks.filter(
                task => task.status === "completed"
              ),
              failedTasks: updatedTasks.filter(
                task => task.status === "failed"
              ),
              taskQueue: updatedTasks.filter(task => task.status === "pending"),
              lastUpdate: event.timestamp,
            };
          });
        },

        taskFinished: (event: TaskFinishedEvent) => {
          set(state => {
            const updatedTasks = state.tasks.map(task => {
              if (task.id === event.taskId) {
                const finishedTask = {
                  ...task,
                  status: event.status,
                  completedAt: event.timestamp,
                  updatedAt: event.timestamp,
                  executionTime: event.executionTime,
                  progress: event.status === "completed" ? 100 : task.progress,
                };

                // Add error if failed
                if (event.status === "failed" && event.error) {
                  finishedTask.error = {
                    code: "EXECUTION_FAILED",
                    message: event.error,
                    retryable: true,
                  };
                }

                // Add result if completed
                if (event.status === "completed" && event.result) {
                  finishedTask.output = {
                    result: event.result,
                    metadata: {
                      executionTime: event.executionTime,
                      resourcesUsed: {},
                    },
                  };
                }

                return finishedTask;
              }
              return task;
            });

            return {
              tasks: updatedTasks,
              runningTasks: updatedTasks.filter(
                task => task.status === "running"
              ),
              completedTasks: updatedTasks.filter(
                task => task.status === "completed"
              ),
              failedTasks: updatedTasks.filter(
                task => task.status === "failed"
              ),
              taskQueue: updatedTasks.filter(task => task.status === "pending"),
              lastUpdate: event.timestamp,
            };
          });
        },

        addTask: task => {
          set(state => {
            const updatedTasks = [...state.tasks, task];
            return {
              tasks: updatedTasks,
              runningTasks: updatedTasks.filter(t => t.status === "running"),
              completedTasks: updatedTasks.filter(
                t => t.status === "completed"
              ),
              failedTasks: updatedTasks.filter(t => t.status === "failed"),
              taskQueue: updatedTasks.filter(t => t.status === "pending"),
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        removeTask: id => {
          set(state => {
            const updatedTasks = state.tasks.filter(task => task.id !== id);
            return {
              tasks: updatedTasks,
              runningTasks: updatedTasks.filter(
                task => task.status === "running"
              ),
              completedTasks: updatedTasks.filter(
                task => task.status === "completed"
              ),
              failedTasks: updatedTasks.filter(
                task => task.status === "failed"
              ),
              taskQueue: updatedTasks.filter(task => task.status === "pending"),
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        updateTaskProgress: (taskId, progress) => {
          set(state => {
            const updatedTasks = state.tasks.map(task =>
              task.id === taskId
                ? { ...task, progress, updatedAt: new Date().toISOString() }
                : task
            );

            return {
              tasks: updatedTasks,
              lastUpdate: new Date().toISOString(),
            };
          });
        },

        setLoading: loading => {
          set({ isLoading: loading });
        },

        setError: error => {
          set({ error });
        },

        getTask: id => {
          return get().tasks.find(task => task.id === id);
        },

        getTasksByAgent: agentId => {
          return get().tasks.filter(task => task.agentId === agentId);
        },

        getTasksByStatus: status => {
          return get().tasks.filter(task => task.status === status);
        },

        getTasksByType: type => {
          return get().tasks.filter(task => task.type === type);
        },

        getTasksByPriority: priority => {
          return get().tasks.filter(task => task.priority === priority);
        },
      }),
      {
        name: "task-storage",
        partialize: state => ({
          tasks: state.tasks,
          completedTasks: state.completedTasks.slice(-50), // Keep last 50 completed tasks
          failedTasks: state.failedTasks.slice(-20), // Keep last 20 failed tasks
        }),
      }
    ),
    { name: "task-store" }
  )
);
