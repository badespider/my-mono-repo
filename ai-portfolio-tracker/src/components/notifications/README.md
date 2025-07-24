# Alert & Notification System

A comprehensive real-time alert and notification system for the AI Portfolio Tracker, featuring toast notifications, alert drawer, and intelligent mute rules.

## Features

### 🔔 Real-time Toast Notifications
- **Custom Toast UI**: Rich toast notifications with severity-based colors and icons
- **WebSocket Integration**: Real-time alerts from the alerts WebSocket stream
- **Persistent Critical Alerts**: Critical alerts don't auto-dismiss
- **Click Actions**: View details or mark as read directly from toast

### 📋 Alert Drawer (Bell Menu)
- **Comprehensive Management**: View, filter, and manage all alerts
- **Tabbed Interface**: All, Unread, Critical, and Resolved tabs
- **Bulk Operations**: Select multiple alerts for bulk actions
- **Search & Filter**: Find specific alerts by content, severity, or type
- **Detailed View**: Full alert information with timestamps and metadata

### 🔕 Intelligent Mute Rules
- **Rule-based Filtering**: Create custom rules to automatically mute alerts
- **Multiple Conditions**: Filter by severity, type, keywords, time ranges
- **Temporary/Permanent**: Set mute duration (permanent or time-limited)
- **Priority System**: Emergency override for critical alerts
- **Quiet Hours**: Time-based muting for better work-life balance

### ⚙️ Agent Configuration
- **Respect Global Rules**: Agents honor user-defined mute settings
- **Emergency Override**: Critical alerts bypass all mute rules
- **Contextual Muting**: Auto-suppress similar alerts during cooldown
- **Configurable Priority**: Set mute rule precedence order

## Components

### ToastManager
```tsx
import { ToastManager } from '@/components/notifications';

// Add to your app shell/layout
<ToastManager />
```

**Features:**
- Listens to WebSocket alert events
- Shows toasts for error/critical alerts (configurable)
- Marks alerts as read when dismissed
- Opens alert drawer when "View Details" is clicked

### AlertDrawer
```tsx
import { AlertDrawer } from '@/components/notifications';

const [isOpen, setIsOpen] = useState(false);

<AlertDrawer 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  initialAlertId="optional-alert-id-to-highlight"
/>
```

**Features:**
- Full alert management interface
- Search, filter, and sort capabilities
- Bulk selection and actions
- Tabbed organization
- Responsive design

### NotificationSettings
```tsx
import { NotificationSettings } from '@/components/notifications';

<NotificationSettings />
```

**Features:**
- General notification preferences
- Mute rule creation and management
- Visual configuration preview
- Persistent settings via localStorage

## Integration

### WebSocket Events
The system listens for `AlertRaisedEvent` from the WebSocket service:

```typescript
interface AlertRaisedEvent {
  id: string;
  type: "price" | "portfolio" | "system" | "agent";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: string;
  portfolioId?: string;
  agentId?: string;
  resolved?: boolean;
}
```

### Store Integration
Uses Zustand alert store for state management:

```typescript
// Alert store methods
const { 
  markAsRead, 
  dismissAlert, 
  acknowledgeAlert, 
  getAlertsCount 
} = useAlertStore();
```

### Header Integration
The header bell icon shows:
- **Unread count badge**: Number of unread alerts
- **Color coding**: Red for critical, blue for unread, gray for none
- **Pulse animation**: Critical alerts pulse the bell icon
- **Click handler**: Opens the alert drawer

## Configuration

### Notification Preferences
Stored in `localStorage` with these options:

```typescript
interface NotificationPreferences {
  enableToasts: boolean;           // Show toast notifications
  enableSounds: boolean;           // Play sounds for critical alerts
  enableDesktopNotifications: boolean; // Browser notifications
  showAllNotifications: boolean;   // Include info/warning (not just errors)
  toastDuration: number;          // How long toasts stay visible
  maxConcurrentToasts: number;    // Max toasts shown at once
  muteRules: MuteRule[];          // Custom mute rules
}
```

### Mute Rules
Rules can filter alerts based on:

```typescript
interface MuteRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    severity?: string[];          // Alert severity levels
    type?: string[];             // Alert types  
    agentId?: string[];          // Specific agents
    portfolioId?: string[];      // Specific portfolios
    keywords?: string[];         // Title/message keywords
    timeRange?: {               // Quiet hours
      start: string;            // HH:mm format
      end: string;              // HH:mm format
    };
  };
  duration?: {
    type: "permanent" | "temporary";
    endTime?: string;           // ISO string for temporary
  };
}
```

### Agent Mute Settings
Each agent can be configured to:
- Respect global mute rules
- Allow emergency override for critical alerts
- Honor quiet hours settings
- Enable contextual muting for similar alerts

## Priority System

Mute rules are applied in this order:

1. **Emergency Override**: Critical alerts always show (if enabled)
2. **Global Mute Rules**: User-defined conditions
3. **Quiet Hours**: Time-based muting
4. **Contextual Muting**: Similar alert suppression
5. **Agent Severity Filters**: Agent-specific settings

## Usage Examples

### Basic Setup
```tsx
// In your app shell
import { ToastManager } from '@/components/notifications';

export function AppShell({ children }) {
  return (
    <>
      {/* Your app content */}
      <ToastManager />
    </>
  );
}
```

### Header with Bell Icon
```tsx
// In your header component
import { AlertDrawer } from '@/components/notifications';
import { useAlertStore } from '@/stores/alertStore';

export function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getAlertsCount } = useAlertStore();
  
  const alertCounts = getAlertsCount();
  const hasUnreadAlerts = alertCounts.unread > 0;
  const hasCriticalAlerts = alertCounts.critical > 0;

  return (
    <>
      <IconButton
        icon={<HiBell />}
        onClick={onOpen}
        color={hasCriticalAlerts ? "red.500" : hasUnreadAlerts ? "blue.500" : "gray.500"}
      />
      {hasUnreadAlerts && (
        <Badge animation={hasCriticalAlerts ? "pulse 2s infinite" : undefined}>
          {alertCounts.unread}
        </Badge>
      )}
      
      <AlertDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
}
```

### Settings Page Integration
```tsx
// In your settings page
import { NotificationSettings } from '@/components/notifications';

export function SettingsPage() {
  return (
    <Tabs>
      <TabList>
        <Tab>Notifications</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <NotificationSettings />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

### Custom Alert Triggers
```tsx
// Triggering alerts from your components
import { useAlertStore } from '@/stores/alertStore';

export function SomeComponent() {
  const { alertRaised } = useAlertStore();

  const handleError = () => {
    alertRaised({
      id: `error-${Date.now()}`,
      type: "system",
      severity: "error",
      title: "System Error",
      message: "Something went wrong",
      timestamp: new Date().toISOString(),
    });
  };
}
```

## Styling

The system uses Chakra UI components with custom styling:
- **Severity Colors**: Blue (info), Yellow (warning), Orange (error), Red (critical)
- **Icons**: Feather icons for consistent UI
- **Animations**: CSS pulse animation for critical alerts
- **Responsive**: Mobile-friendly design

## Future Enhancements

- **Desktop Notifications**: Browser notification API integration
- **Sound Alerts**: Audio notifications for critical alerts
- **Email/SMS Integration**: External notification channels
- **Analytics**: Alert frequency and resolution tracking
- **Templates**: Pre-configured mute rule templates
- **Agent-specific Rules**: Per-agent notification preferences
