import { Connection, PublicKey, Transaction, SendOptions } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface SolanaRpcConfig {
  endpoint: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface SolanaTransaction {
  transaction: Transaction;
  signers?: any[];
}

export interface UseSolanaResult {
  connection: Connection | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  wallet: WalletContextState['wallet'];
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ) => Promise<string>;
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined;
  signAllTransactions: ((transactions: Transaction[]) => Promise<Transaction[]>) | undefined;
  disconnect: () => Promise<void>;
  // Agent-specific RPC methods
  getAccountInfo: (address: string) => Promise<any>;
  getTokenAccountsByOwner: (owner: string) => Promise<any[]>;
  getBalance: (address?: string) => Promise<number>;
  getRecentBlockhash: () => Promise<string>;
}

/**
 * Creates a Solana connection with the provided configuration
 */
export const createSolanaConnection = (config: SolanaRpcConfig): Connection => {
  return new Connection(config.endpoint, config.commitment || 'confirmed');
};

/**
 * Utility function to validate Solana addresses
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1e9;
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1e9);
};

/**
 * Get token accounts for a wallet address
 */
export const getTokenAccounts = async (
  connection: Connection,
  walletAddress: string,
  tokenProgramId?: string
): Promise<any[]> => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const tokenProgramPublicKey = tokenProgramId 
      ? new PublicKey(tokenProgramId)
      : new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'); // SPL Token Program ID

    const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: tokenProgramPublicKey,
    });

    return response.value.map((accountInfo) => ({
      pubkey: accountInfo.pubkey.toString(),
      account: accountInfo.account,
      parsedData: accountInfo.account.data.parsed,
    }));
  } catch (error) {
    console.error('Error fetching token accounts:', error);
    throw error;
  }
};

/**
 * Get SOL balance for an address
 */
export const getSolBalance = async (
  connection: Connection,
  address: string
): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return lamportsToSol(balance);
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    throw error;
  }
};

/**
 * Default Solana RPC endpoints
 */
export const SOLANA_RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://localhost:8899',
} as const;

export type SolanaNetwork = keyof typeof SOLANA_RPC_ENDPOINTS;
