import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'portfolio' | 'price' | 'system' | 'rebalance' | 'agent';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent: boolean; // whether alert stays until manually dismissed
  agentId?: string; // which agent generated this alert
  relatedEntityId?: string; // related task, position, etc.
  metadata?: Record<string, any>;
  actions?: {
    id: string;
    label: string;
    type: 'button' | 'link';
    variant?: 'primary' | 'secondary' | 'danger';
    action: string; // redux action type or URL
    payload?: any;
  }[];
}

interface AlertsState {
  byId: Record<string, Alert>;
  allIds: string[];
  unreadIds: string[];
  readIds: string[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  byId: {},
  allIds: [],
  unreadIds: [],
  readIds: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      const alert = action.payload;
      state.byId[alert.id] = alert;
      
      if (!state.allIds.includes(alert.id)) {
        state.allIds.unshift(alert.id); // Add to beginning for newest-first order
      }
      
      if (!alert.read) {
        if (!state.unreadIds.includes(alert.id)) {
          state.unreadIds.unshift(alert.id);
        }
        state.unreadCount = state.unreadIds.length;
      } else {
        if (!state.readIds.includes(alert.id)) {
          state.readIds.unshift(alert.id);
        }
      }
    },
    addAlerts: (state, action: PayloadAction<Alert[]>) => {
      action.payload.forEach(alert => {
        state.byId[alert.id] = alert;
        
        if (!state.allIds.includes(alert.id)) {
          state.allIds.unshift(alert.id);
        }
        
        if (!alert.read) {
          if (!state.unreadIds.includes(alert.id)) {
            state.unreadIds.unshift(alert.id);
          }
        } else {
          if (!state.readIds.includes(alert.id)) {
            state.readIds.unshift(alert.id);
          }
        }
      });
      
      state.unreadCount = state.unreadIds.length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.byId[id] && !state.byId[id].read) {
        state.byId[id].read = true;
        
        // Move from unread to read
        state.unreadIds = state.unreadIds.filter(alertId => alertId !== id);
        state.readIds.unshift(id);
        state.unreadCount = state.unreadIds.length;
      }
    },
    markAsUnread: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.byId[id] && state.byId[id].read) {
        state.byId[id].read = false;
        
        // Move from read to unread
        state.readIds = state.readIds.filter(alertId => alertId !== id);
        state.unreadIds.unshift(id);
        state.unreadCount = state.unreadIds.length;
      }
    },
    markAllAsRead: (state) => {
      state.unreadIds.forEach(id => {
        if (state.byId[id]) {
          state.byId[id].read = true;
        }
      });
      
      // Move all unread to read
      state.readIds = [...state.unreadIds, ...state.readIds];
      state.unreadIds = [];
      state.unreadCount = 0;
    },
    markMultipleAsRead: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        if (state.byId[id] && !state.byId[id].read) {
          state.byId[id].read = true;
          
          // Move from unread to read
          state.unreadIds = state.unreadIds.filter(alertId => alertId !== id);
          state.readIds.unshift(id);
        }
      });
      
      state.unreadCount = state.unreadIds.length;
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter(alertId => alertId !== id);
      state.unreadIds = state.unreadIds.filter(alertId => alertId !== id);
      state.readIds = state.readIds.filter(alertId => alertId !== id);
      state.unreadCount = state.unreadIds.length;
    },
    removeMultipleAlerts: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        delete state.byId[id];
        state.allIds = state.allIds.filter(alertId => alertId !== id);
        state.unreadIds = state.unreadIds.filter(alertId => alertId !== id);
        state.readIds = state.readIds.filter(alertId => alertId !== id);
      });
      
      state.unreadCount = state.unreadIds.length;
    },
    clearAlerts: (state, action: PayloadAction<'all' | 'read' | 'unread' | 'by-category' | 'by-agent', { category?: string; agentId?: string } = {}>) => {
      const { type, meta = {} } = action.payload;
      
      if (type === 'all') {
        state.byId = {};
        state.allIds = [];
        state.unreadIds = [];
        state.readIds = [];
        state.unreadCount = 0;
      } else if (type === 'read') {
        state.readIds.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(id => !state.readIds.includes(id));
        state.readIds = [];
      } else if (type === 'unread') {
        state.unreadIds.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(id => !state.unreadIds.includes(id));
        state.unreadIds = [];
        state.unreadCount = 0;
      } else if (type === 'by-category' && meta.category) {
        const idsToRemove = state.allIds.filter(id => 
          state.byId[id] && state.byId[id].category === meta.category
        );
        idsToRemove.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(id => !idsToRemove.includes(id));
        state.unreadIds = state.unreadIds.filter(id => !idsToRemove.includes(id));
        state.readIds = state.readIds.filter(id => !idsToRemove.includes(id));
        state.unreadCount = state.unreadIds.length;
      } else if (type === 'by-agent' && meta.agentId) {
        const idsToRemove = state.allIds.filter(id => 
          state.byId[id] && state.byId[id].agentId === meta.agentId
        );
        idsToRemove.forEach(id => {
          delete state.byId[id];
        });
        state.allIds = state.allIds.filter(id => !idsToRemove.includes(id));
        state.unreadIds = state.unreadIds.filter(id => !idsToRemove.includes(id));
        state.readIds = state.readIds.filter(id => !idsToRemove.includes(id));
        state.unreadCount = state.unreadIds.length;
      }
    },
    updateAlert: (state, action: PayloadAction<Partial<Alert> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        const wasRead = state.byId[id].read;
        state.byId[id] = { ...state.byId[id], ...updates };
        
        // Handle read status change
        if (typeof updates.read === 'boolean' && updates.read !== wasRead) {
          if (updates.read) {
            // Move from unread to read
            state.unreadIds = state.unreadIds.filter(alertId => alertId !== id);
            state.readIds.unshift(id);
          } else {
            // Move from read to unread
            state.readIds = state.readIds.filter(alertId => alertId !== id);
            state.unreadIds.unshift(id);
          }
          state.unreadCount = state.unreadIds.length;
        }
      }
    },
    // Auto-cleanup old alerts (keep last 500)
    cleanupOldAlerts: (state) => {
      if (state.allIds.length > 500) {
        const idsToKeep = state.allIds.slice(0, 500);
        const idsToRemove = state.allIds.slice(500);
        
        idsToRemove.forEach(id => {
          delete state.byId[id];
        });
        
        state.allIds = idsToKeep;
        state.unreadIds = state.unreadIds.filter(id => idsToKeep.includes(id));
        state.readIds = state.readIds.filter(id => idsToKeep.includes(id));
        state.unreadCount = state.unreadIds.length;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  addAlert,
  addAlerts,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  markMultipleAsRead,
  removeAlert,
  removeMultipleAlerts,
  clearAlerts,
  updateAlert,
  cleanupOldAlerts,
} = alertsSlice.actions;
