import { configureStore } from "@reduxjs/toolkit";
import { agentsSlice } from "./slices/agentsSlice";
import { tasksSlice } from "./slices/tasksSlice";
import { portfolioSlice } from "./slices/portfolioSlice";
import { alertsSlice } from "./slices/alertsSlice";
import { realtimeMiddleware } from "./middleware/realtimeMiddleware";

export const store = configureStore({
  reducer: {
    agents: agentsSlice.reducer,
    tasks: tasksSlice.reducer,
    portfolio: portfolioSlice.reducer,
    alerts: alertsSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(realtimeMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
