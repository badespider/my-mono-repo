import { useMemo, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { 
  UseSolanaResult, 
  getTokenAccounts, 
  getSolBalance,
  lamportsToSol 
} from '../utils/solana';

/**
 * Custom hook that provides Solana wallet functionality and RPC methods
 * specifically designed for agent interactions in the portfolio tracker
 */
export const useSolana = (): UseSolanaResult => {
  const { connection } = useConnection();
  const { 
    publicKey, 
    connected, 
    connecting, 
    wallet, 
    sendTransaction, 
    signTransaction, 
    signAllTransactions, 
    disconnect 
  } = useWallet();

  // Agent-specific RPC method: Get account info
  const getAccountInfo = useCallback(
    async (address: string) => {
      if (!connection) {
        throw new Error('Solana connection not available');
      }

      try {
        const publicKey = new PublicKey(address);
        const accountInfo = await connection.getAccountInfo(publicKey);
        
        return {
          address,
          lamports: accountInfo?.lamports || 0,
          sol: accountInfo ? lamportsToSol(accountInfo.lamports) : 0,
          owner: accountInfo?.owner?.toString(),
          executable: accountInfo?.executable || false,
          rentEpoch: accountInfo?.rentEpoch,
          data: accountInfo?.data,
        };
      } catch (error) {
        console.error('Error fetching account info:', error);
        throw error;
      }
    },
    [connection]
  );

  // Agent-specific RPC method: Get token accounts by owner
  const getTokenAccountsByOwner = useCallback(
    async (owner: string) => {
      if (!connection) {
        throw new Error('Solana connection not available');
      }

      try {
        return await getTokenAccounts(connection, owner);
      } catch (error) {
        console.error('Error fetching token accounts:', error);
        throw error;
      }
    },
    [connection]
  );

  // Agent-specific RPC method: Get balance
  const getBalance = useCallback(
    async (address?: string) => {
      if (!connection) {
        throw new Error('Solana connection not available');
      }

      const targetAddress = address || publicKey?.toString();
      if (!targetAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      try {
        return await getSolBalance(connection, targetAddress);
      } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
      }
    },
    [connection, publicKey]
  );

  // Agent-specific RPC method: Get recent blockhash
  const getRecentBlockhash = useCallback(
    async () => {
      if (!connection) {
        throw new Error('Solana connection not available');
      }

      try {
        const { blockhash } = await connection.getLatestBlockhash();
        return blockhash;
      } catch (error) {
        console.error('Error fetching recent blockhash:', error);
        throw error;
      }
    },
    [connection]
  );

  // Memoize the result to avoid unnecessary re-renders
  const result = useMemo(
    (): UseSolanaResult => ({
      connection,
      publicKey,
      connected,
      connecting,
      wallet,
      sendTransaction: sendTransaction || (() => Promise.reject(new Error('Send transaction not available'))),
      signTransaction,
      signAllTransactions,
      disconnect: disconnect || (() => Promise.resolve()),
      // Agent-specific methods
      getAccountInfo,
      getTokenAccountsByOwner,
      getBalance,
      getRecentBlockhash,
    }),
    [
      connection,
      publicKey,
      connected,
      connecting,
      wallet,
      sendTransaction,
      signTransaction,
      signAllTransactions,
      disconnect,
      getAccountInfo,
      getTokenAccountsByOwner,
      getBalance,
      getRecentBlockhash,
    ]
  );

  return result;
};

export default useSolana;
