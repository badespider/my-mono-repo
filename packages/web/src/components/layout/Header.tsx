import React, { useState } from 'react';
import { Bell, Wallet, User, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAgentStore } from '../../stores/agentStore';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatCurrency } from '@org/shared';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const { getUnreadAlertCount, getCriticalAlertCount, alerts } = useAgentStore();
  const { isConnected: walletConnected, walletAddress, portfolio } = usePortfolioStore();
  const { isConnected: wsConnected } = useWebSocket('ws://localhost:8080');
  
  const unreadCount = getUnreadAlertCount();
  const criticalCount = getCriticalAlertCount();

  const connectWallet = () => {
    // Placeholder for wallet connection logic
    console.log('Connect wallet clicked');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Portfolio Tracker</h1>
              <p className="text-xs text-gray-500">Powered by Solana & Virtuals Protocol</p>
            </div>
          </div>
          
          {/* WebSocket Status */}
          <div className="flex items-center space-x-2">
            {wsConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-4 h-4 mr-1" />
                <span className="text-xs">Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-4 h-4 mr-1" />
                <span className="text-xs">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-medium text-white rounded-full flex items-center justify-center ${
                  criticalCount > 0 ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !alert.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={alert.type === 'critical' ? 'error' : 'info'} size="sm">
                              {alert.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wallet Connection */}
          {walletConnected ? (
            <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {walletAddress && formatAddress(walletAddress)}
                </p>
                <p className="text-xs text-green-600">
                  {portfolio && formatCurrency(portfolio.totalValue)}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Connect Wallet</span>
            </button>
          )}

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <User className="w-6 h-6" />
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;