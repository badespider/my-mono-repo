"use client";

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@chakra-ui/react';
import {
  executeAgentOperation,
  startAllAgents,
  stopAllAgents,
  VirtualsTransactionResult,
  AgentOperation,
} from '../services/virtuals';
import { Agent } from '../services/types/api';

export interface AgentTxMutation {
  isLoading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<VirtualsTransactionResult | VirtualsTransactionResult[]>;
}

export interface UseAgentTxReturn {
  // Individual agent operations
  startAgent: AgentTxMutation;
  stopAgent: AgentTxMutation;
  monitorAgent: AgentTxMutation;
  analyzeAgent: AgentTxMutation;
  rebalanceAgent: AgentTxMutation;
  alertAgent: AgentTxMutation;
  
  // Bulk operations
  startAllAgentsMutation: AgentTxMutation;
  stopAllAgentsMutation: AgentTxMutation;
  
  // Transaction history
  recentTransactions: VirtualsTransactionResult[];
  clearTransactionHistory: () => void;
}

/**
 * Hook for agent transaction mutations with Virtuals Protocol
 */
export function useAgentTx(): UseAgentTxReturn {
  const { connection } = useConnection();
  const wallet = useWallet();
  const toast = useToast();
  
  const [recentTransactions, setRecentTransactions] = useState<VirtualsTransactionResult[]>([]);

  // Helper function to create mutation object
  const createMutation = (
    operation: AgentOperation | 'start_all' | 'stop_all',
    executor: (...args: any[]) => Promise<VirtualsTransactionResult | VirtualsTransactionResult[]>
  ): AgentTxMutation => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (...args: any[]) => {
      if (!wallet.connected || !wallet.publicKey) {
        const errorMsg = 'Wallet not connected';
        setError(errorMsg);
        toast({
          title: "Wallet Error",
          description: errorMsg,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw new Error(errorMsg);
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await executor(...args);
        
        // Add to transaction history
        if (Array.isArray(result)) {
          setRecentTransactions(prev => [...result, ...prev].slice(0, 50)); // Keep last 50
          
          const successCount = result.filter(r => r.success).length;
          const failCount = result.length - successCount;
          
          toast({
            title: `Bulk ${operation.replace('_', ' ')} completed`,
            description: `${successCount} successful, ${failCount} failed`,
            status: failCount === 0 ? "success" : "warning",
            duration: 5000,
            isClosable: true,
          });
        } else {
          setRecentTransactions(prev => [result, ...prev].slice(0, 50));
          
          toast({
            title: result.success ? "Transaction successful" : "Transaction failed",
            description: result.success 
              ? `Agent ${operation} completed successfully`
              : result.error || "Transaction failed",
            status: result.success ? "success" : "error",
            duration: 5000,
            isClosable: true,
          });
        }
        
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMsg);
        
        toast({
          title: "Transaction Error",
          description: errorMsg,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, [wallet, executor, operation, toast]);

    return { isLoading, error, execute };
  };

  // Individual agent operations
  const startAgent = createMutation('start', 
    (agent: Agent, portfolioId?: string) => 
      executeAgentOperation(connection, wallet, agent, 'start', portfolioId)
  );

  const stopAgent = createMutation('stop', 
    (agent: Agent) => 
      executeAgentOperation(connection, wallet, agent, 'stop')
  );

  const monitorAgent = createMutation('monitor', 
    (agent: Agent, portfolioId: string) => 
      executeAgentOperation(connection, wallet, agent, 'monitor', portfolioId)
  );

  const analyzeAgent = createMutation('analyze', 
    (agent: Agent, portfolioId: string) => 
      executeAgentOperation(connection, wallet, agent, 'analyze', portfolioId)
  );

  const rebalanceAgent = createMutation('rebalance', 
    (agent: Agent, portfolioId: string) => 
      executeAgentOperation(connection, wallet, agent, 'rebalance', portfolioId)
  );

  const alertAgent = createMutation('alert', 
    (agent: Agent, alertConfig: any) => 
      executeAgentOperation(connection, wallet, agent, 'alert', undefined, alertConfig)
  );

  // Bulk operations
  const startAllAgentsMutation = createMutation('start_all', 
    (agents: Agent[], agentType?: Agent['type']) => 
      startAllAgents(connection, wallet, agents, agentType)
  );

  const stopAllAgentsMutation = createMutation('stop_all', 
    (agents: Agent[], agentType?: Agent['type']) => 
      stopAllAgents(connection, wallet, agents, agentType)
  );

  const clearTransactionHistory = useCallback(() => {
    setRecentTransactions([]);
  }, []);

  return {
    // Individual operations
    startAgent,
    stopAgent,
    monitorAgent,
    analyzeAgent,
    rebalanceAgent,
    alertAgent,
    
    // Bulk operations
    startAllAgentsMutation,
    stopAllAgentsMutation,
    
    // Transaction history
    recentTransactions,
    clearTransactionHistory,
  };
}
