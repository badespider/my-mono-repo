import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Bot, 
  ListTodo, 
  Settings,
  Bell,
  Wallet,
  Menu,
  X,
  Check,
  AlertTriangle,
  Info,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  agent?: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Portfolio Rebalanced',
      message: 'Auto rebalancing agent successfully adjusted SOL allocation from 45.2% to 40.0%',
      type: 'success',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      agent: 'Rebalancing Agent'
    },
    {
      id: '2',
      title: 'High Volatility Alert',
      message: 'RAY token showing 12% volatility spike. Risk threshold exceeded.',
      type: 'warning',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      agent: 'Risk Analysis Agent'
    },
    {
      id: '3',
      title: 'Agent Maintenance',
      message: 'Rebalancing agent entering scheduled maintenance mode',
      type: 'info',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      agent: 'System'
    }
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", active: location.pathname === "/" },
    { name: "Portfolio", icon: Briefcase, href: "/portfolio", active: location.pathname === "/portfolio" },
    { name: "Agents", icon: Bot, href: "/agents", active: location.pathname === "/agents" },
    { name: "Tasks", icon: ListTodo, href: "/tasks", active: location.pathname === "/tasks" },
    { name: "Settings", icon: Settings, href: "/settings", active: location.pathname === "/settings" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-status-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'error': return <X className="h-4 w-4 text-status-error" />;
      case 'info': return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Portfolio Tracker</h1>
              <p className="text-xs text-muted-foreground">Solana Multi-Agent System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <Card className="absolute right-0 top-12 w-80 max-h-96 z-50 bg-card border-border shadow-glow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div key={notification.id}>
                            <div 
                              className={`
                                p-4 hover:bg-muted/20 transition-colors cursor-pointer
                                ${!notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                              `}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-medium text-foreground truncate">
                                      {notification.title}
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {notification.agent}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(notification.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index < notifications.length - 1 && <Separator />}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Wallet Connection */}
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden md:inline">Connect Wallet</span>
          </Button>

          {/* Profile */}
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} 
          transition-all duration-300 bg-card border-r border-border
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative h-[calc(100vh-4rem)] z-40 overflow-hidden
        `}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={item.active ? "secondary" : "ghost"}
                className={`
                  w-full justify-start gap-3 h-11 cursor-pointer
                  ${item.active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}
                  ${!sidebarOpen && 'lg:justify-center lg:px-2'}
                `}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false); // Close mobile sidebar after navigation
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(sidebarOpen) && <span>{item.name}</span>}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;