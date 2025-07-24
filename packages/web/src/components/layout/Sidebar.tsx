import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Bot, 
  ListTodo, 
  Settings,
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/',
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: Briefcase,
      current: location.pathname === '/portfolio',
    },
    {
      name: 'Agents',
      href: '/agents',
      icon: Bot,
      current: location.pathname === '/agents',
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: ListTodo,
      current: location.pathname === '/tasks',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {item.current && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Agent Status Summary */}
      <div className="mt-8 px-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Active Agents</span>
              <span className="font-medium text-green-600">3/4</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Running Tasks</span>
              <span className="font-medium text-blue-600">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Alerts</span>
              <span className="font-medium text-red-600">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;