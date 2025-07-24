import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Agent } from './types/api';

/**
 * Virtuals Protocol smart contract interactions
 * This integrates with the @virtuals-protocol/anchor-sdk for agent operations
 */

// Program ID for Virtuals Protocol (this would be the actual program ID)
const VIRTUALS_PROGRAM_ID = new PublicKey('VirtuaLsProtoco1111111111111111111111111111');

// Agent operation types
export type AgentOperation = 'start' | 'stop' | 'monitor' | 'analyze' | 'rebalance' | 'alert';

// Transaction result interface
export interface VirtualsTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  agentId: string;
  operation: AgentOperation;
  timestamp: Date;
}

/**
 * Create instruction for starting an agent
 */
function createStartAgentInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey,
  agentType: Agent['type']
): TransactionInstruction {
  // This would use the actual Virtuals Protocol SDK
  // For now, creating a mock instruction
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.from([0, ...Buffer.from(agentType)]), // Mock instruction data
  });
}

/**
 * Create instruction for stopping an agent
 */
function createStopAgentInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.from([1]), // Stop instruction
  });
}

/**
 * Create instruction for agent monitoring
 */
function createMonitorInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey,
  portfolioPda: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: portfolioPda, isSigner: false, isWritable: false },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.from([2]), // Monitor instruction
  });
}

/**
 * Create instruction for portfolio analysis
 */
function createAnalyzeInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey,
  portfolioPda: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: portfolioPda, isSigner: false, isWritable: false },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.from([3]), // Analyze instruction
  });
}

/**
 * Create instruction for portfolio rebalancing
 */
function createRebalanceInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey,
  portfolioPda: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: portfolioPda, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.from([4]), // Rebalance instruction
  });
}

/**
 * Create instruction for setting up alerts
 */
function createAlertInstruction(
  agentPda: PublicKey,
  userPubkey: PublicKey,
  alertConfig: Buffer
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    programId: VIRTUALS_PROGRAM_ID,
    data: Buffer.concat([Buffer.from([5]), alertConfig]), // Alert instruction with config
  });
}

/**
 * Derive PDA for agent account
 */
export function deriveAgentPda(agentId: string, userPubkey: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), Buffer.from(agentId), userPubkey.toBuffer()],
    VIRTUALS_PROGRAM_ID
  );
  return pda;
}

/**
 * Derive PDA for portfolio account
 */
export function derivePortfolioPda(portfolioId: string, userPubkey: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('portfolio'), Buffer.from(portfolioId), userPubkey.toBuffer()],
    VIRTUALS_PROGRAM_ID
  );
  return pda;
}

/**
 * Execute agent operation on Virtuals Protocol
 */
export async function executeAgentOperation(
  connection: Connection,
  wallet: WalletContextState,
  agent: Agent,
  operation: AgentOperation,
  portfolioId?: string,
  alertConfig?: any
): Promise<VirtualsTransactionResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  try {
    const transaction = new Transaction();
    const agentPda = deriveAgentPda(agent.id, wallet.publicKey);
    const portfolioPda = portfolioId 
      ? derivePortfolioPda(portfolioId, wallet.publicKey)
      : agentPda; // Use agent PDA as fallback

    // Add appropriate instruction based on operation
    switch (operation) {
      case 'start':
        transaction.add(createStartAgentInstruction(agentPda, wallet.publicKey, agent.type));
        break;
      
      case 'stop':
        transaction.add(createStopAgentInstruction(agentPda, wallet.publicKey));
        break;
      
      case 'monitor':
        transaction.add(createMonitorInstruction(agentPda, wallet.publicKey, portfolioPda));
        break;
      
      case 'analyze':
        transaction.add(createAnalyzeInstruction(agentPda, wallet.publicKey, portfolioPda));
        break;
      
      case 'rebalance':
        transaction.add(createRebalanceInstruction(agentPda, wallet.publicKey, portfolioPda));
        break;
      
      case 'alert':
        const alertConfigBuffer = alertConfig ? Buffer.from(JSON.stringify(alertConfig)) : Buffer.alloc(0);
        transaction.add(createAlertInstruction(agentPda, wallet.publicKey, alertConfigBuffer));
        break;
      
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Get recent blockhash and set fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return {
      signature,
      success: true,
      agentId: agent.id,
      operation,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Agent operation failed:', error);
    return {
      signature: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      agentId: agent.id,
      operation,
      timestamp: new Date(),
    };
  }
}

/**
 * Start all agents of a specific type
 */
export async function startAllAgents(
  connection: Connection,
  wallet: WalletContextState,
  agents: Agent[],
  agentType?: Agent['type']
): Promise<VirtualsTransactionResult[]> {
  const targetAgents = agentType 
    ? agents.filter(agent => agent.type === agentType)
    : agents;

  const results: VirtualsTransactionResult[] = [];
  
  for (const agent of targetAgents) {
    if (agent.status !== 'active') {
      const result = await executeAgentOperation(connection, wallet, agent, 'start');
      results.push(result);
    }
  }
  
  return results;
}

/**
 * Stop all agents of a specific type
 */
export async function stopAllAgents(
  connection: Connection,
  wallet: WalletContextState,
  agents: Agent[],
  agentType?: Agent['type']
): Promise<VirtualsTransactionResult[]> {
  const targetAgents = agentType 
    ? agents.filter(agent => agent.type === agentType)
    : agents;

  const results: VirtualsTransactionResult[] = [];
  
  for (const agent of targetAgents) {
    if (agent.status === 'active') {
      const result = await executeAgentOperation(connection, wallet, agent, 'stop');
      results.push(result);
    }
  }
  
  return results;
}

