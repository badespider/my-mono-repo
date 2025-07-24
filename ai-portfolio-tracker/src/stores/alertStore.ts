// Simplified mock alert store for compatibility
export interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  timestamp: string;
  readAt?: string;
  resolved?: boolean;
  acknowledged?: boolean;
}

// Mock store hook
export function useAlertStore() {
  return {
    getAlertsCount: () => ({
      total: 0,
      unread: 0,
      critical: 0,
      acknowledged: 0,
      resolved: 0,
    }),
    markAsRead: (id: string) => {
      console.log('Mark as read:', id);
    },
    dismissAlert: (id: string) => {
      console.log('Dismiss alert:', id);
    },
    acknowledgeAlert: (id: string) => {
      console.log('Acknowledge alert:', id);
    },
    resolveAlert: (id: string) => {
      console.log('Resolve alert:', id);
    },
  };
}
