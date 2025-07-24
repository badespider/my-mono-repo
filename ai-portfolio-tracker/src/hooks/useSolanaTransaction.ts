"use client";

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Transaction, 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionSignature,
  ConfirmOptions,
} from '@solana/web3.js';
import { useToast } from '@chakra-ui/react';

export interface TransactionStatus {
  signature?: string;
  status: 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';
  error?: string;
}

export interface PendingTransaction {
  id: string;
  type: 'rebalance' | 'transfer' | 'swap';
  description: string;
  transaction: Transaction;
  requiresApproval: boolean;
  estimatedFee?: number;
  timestamp: number;
}

export function useSolanaTransaction() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const toast = useToast();
  
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'idle'
  });
  
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionStatus[]>([]);

  const createTransaction = useCallback(async (
    recipientAddress: string,
    amount: number // in SOL
  ): Promise<Transaction> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    return transaction;
  }, [connection, publicKey]);

  const estimateTransactionFee = useCallback(async (
    transaction: Transaction
  ): Promise<number> => {
    try {
      const fee = await connection.getFeeForMessage(
        transaction.compileMessage(),
        'confirmed'
      );
      return fee?.value ? fee.value / LAMPORTS_PER_SOL : 0.000005; // Default fee estimate
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 0.000005; // Default fallback fee
    }
  }, [connection]);

  const addPendingTransaction = useCallback((
    type: PendingTransaction['type'],
    description: string,
    transaction: Transaction,
    requiresApproval: boolean = true
  ) => {
    const pendingTx: PendingTransaction = {
      id: Date.now().toString(),
      type,
      description,
      transaction,
      requiresApproval,
      timestamp: Date.now(),
    };

    // Estimate fee
    estimateTransactionFee(transaction).then(fee => {
      setPendingTransactions(prev => 
        prev.map(tx => tx.id === pendingTx.id ? { ...tx, estimatedFee: fee } : tx)
      );
    });

    setPendingTransactions(prev => [...prev, pendingTx]);
    return pendingTx.id;
  }, [estimateTransactionFee]);

  const removePendingTransaction = useCallback((id: string) => {
    setPendingTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const executeTransaction = useCallback(async (
    transaction: Transaction,
    options?: ConfirmOptions
  ): Promise<string> => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      throw new Error('Wallet not connected or does not support required operations');
    }

    setTransactionStatus({ status: 'pending' });

    try {
      // Get fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection, options);
      
      setTransactionStatus({
        status: 'confirming',
        signature
      });

      toast({
        title: "Transaction submitted",
        description: `Transaction signature: ${signature.slice(0, 8)}...`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      setTransactionStatus({
        status: 'confirmed',
        signature
      });

      // Add to recent transactions
      setRecentTransactions(prev => [{
        status: 'confirmed',
        signature
      }, ...prev.slice(0, 9)]); // Keep last 10 transactions

      toast({
        title: "Transaction confirmed",
        description: "Transaction has been successfully processed",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      return signature;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      setTransactionStatus({
        status: 'failed',
        error: error.message
      });

      toast({
        title: "Transaction failed",
        description: error.message || "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      throw error;
    }
  }, [publicKey, signTransaction, sendTransaction, connection, toast]);

  const executeRebalanceTransaction = useCallback(async (
    txId: string
  ): Promise<string> => {
    const pendingTx = pendingTransactions.find(tx => tx.id === txId);
    if (!pendingTx) {
      throw new Error('Transaction not found');
    }

    try {
      const signature = await executeTransaction(pendingTx.transaction);
      removePendingTransaction(txId);
      return signature;
    } catch (error) {
      // Keep transaction in pending list if it failed
      throw error;
    }
  }, [pendingTransactions, executeTransaction, removePendingTransaction]);

  const getBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }, [connection, publicKey]);

  const getTransactionStatus = useCallback(async (
    signature: string
  ): Promise<'confirmed' | 'failed' | 'pending'> => {
    try {
      const status = await connection.getSignatureStatus(signature);
      
      if (status.value?.confirmationStatus === 'confirmed' || 
          status.value?.confirmationStatus === 'finalized') {
        return 'confirmed';
      } else if (status.value?.err) {
        return 'failed';
      } else {
        return 'pending';
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return 'failed';
    }
  }, [connection]);

  const resetTransactionStatus = useCallback(() => {
    setTransactionStatus({ status: 'idle' });
  }, []);

  return {
    // Transaction operations
    createTransaction,
    executeTransaction,
    executeRebalanceTransaction,
    estimateTransactionFee,
    
    // Transaction management
    addPendingTransaction,
    removePendingTransaction,
    
    // State
    transactionStatus,
    pendingTransactions,
    recentTransactions,
    
    // Utility functions
    getBalance,
    getTransactionStatus,
    resetTransactionStatus,
    
    // Wallet state
    isConnected: !!publicKey,
    walletAddress: publicKey?.toString(),
  };
}
