import { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { usePortfolioStore } from '../stores/portfolioStore';
import { WebSocketMessage } from '../types/agents';
import toast from 'react-hot-toast';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { updateAgent, updateTask, addAlert } = useAgentStore();
  const { updateHoldingPrice } = usePortfolioStore();

  const connect = () => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        console.log('WebSocket connected');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < 5) {
          const delay = Math.pow(2, reconnectAttempts) * 1000;
          reconnectTimer.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'agent_status':
        updateAgent(message.data.id, message.data);
        break;
        
      case 'task_update':
        updateTask(message.data.id, message.data);
        break;
        
      case 'price_update':
        updateHoldingPrice(
          message.data.symbol,
          message.data.price,
          message.data.change24h
        );
        break;
        
      case 'alert':
        addAlert(message.data);
        
        // Show toast notification for critical alerts
        if (message.data.type === 'critical') {
          toast.error(message.data.title, {
            duration: 10000,
            position: 'top-right',
          });
        } else if (message.data.type === 'warning') {
          toast(message.data.title, {
            icon: '⚠️',
            duration: 5000,
            position: 'top-right',
          });
        }
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return { isConnected, sendMessage };
};