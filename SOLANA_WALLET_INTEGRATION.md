# Solana Wallet Integration

This document outlines the Solana wallet integration for the AI Portfolio Tracker project.

## Overview

The integration provides:
1. **WalletProvider**: React context provider wrapping Solana wallet functionality
2. **useSolana Hook**: Shared utility hook for agent RPC interactions
3. **Wallet UI Components**: Pre-built components for wallet connection

## Architecture

### 1. WalletProvider (`packages/web/src/providers/WalletProvider.tsx`)

Wraps the application with Solana wallet context providers:
- `ConnectionProvider`: Manages Solana RPC connection
- `WalletProvider`: Handles wallet adapters and state
- `WalletModalProvider`: Provides wallet selection modal

**Supported Wallets:**
- Phantom
- Solflare
- Torus
- Ledger
- Sollet
- MathWallet
- Coin98
- TrustWallet
- Backpack

**Configuration:**
- Network: Devnet (configurable)
- Auto-connect: Enabled
- Custom RPC endpoint support

### 2. useSolana Hook (`packages/shared/src/hooks/useSolana.ts`)

Provides a unified interface for wallet operations and RPC calls:

```typescript
const {
  // Wallet state
  connection,
  publicKey,
  connected,
  connecting,
  wallet,
  
  // Wallet operations
  sendTransaction,
  signTransaction,
  signAllTransactions,
  disconnect,
  
  // Agent-specific RPC methods
  getAccountInfo,
  getTokenAccountsByOwner,
  getBalance,
  getRecentBlockhash,
} = useSolana();
```

### 3. Utility Functions (`packages/shared/src/utils/solana.ts`)

Helper functions for Solana operations:
- `createSolanaConnection()`: Create connection with custom config
- `isValidSolanaAddress()`: Validate Solana addresses
- `lamportsToSol()` / `solToLamports()`: Currency conversion
- `getTokenAccounts()`: Fetch token accounts for a wallet
- `getSolBalance()`: Get SOL balance for an address

## Usage Examples

### Basic Wallet Connection

```tsx
import { useSolana } from '@org/shared';

function MyComponent() {
  const { connected, publicKey, getBalance } = useSolana();
  
  const handleGetBalance = async () => {
    if (connected) {
      const balance = await getBalance();
      console.log(`Balance: ${balance} SOL`);
    }
  };

  return (
    <div>
      {connected ? (
        <p>Connected: {publicKey?.toString()}</p>
      ) : (
        <p>Not connected</p>
      )}
      <button onClick={handleGetBalance}>Get Balance</button>
    </div>
  );
}
```

### Agent RPC Interactions

```tsx
import { useSolana } from '@org/shared';

function AgentComponent() {
  const { getTokenAccountsByOwner, getAccountInfo } = useSolana();
  
  const analyzeWallet = async (walletAddress: string) => {
    try {
      // Get all token accounts
      const tokenAccounts = await getTokenAccountsByOwner(walletAddress);
      
      // Get account details
      const accountInfo = await getAccountInfo(walletAddress);
      
      // Agent analysis logic here
      console.log('Token accounts:', tokenAccounts);
      console.log('Account info:', accountInfo);
    } catch (error) {
      console.error('Agent analysis failed:', error);
    }
  };

  return (
    // Component JSX
  );
}
```

### Custom Connection Configuration

```tsx
import { createSolanaConnection, SOLANA_RPC_ENDPOINTS } from '@org/shared';

const customConnection = createSolanaConnection({
  endpoint: SOLANA_RPC_ENDPOINTS.mainnet,
  commitment: 'confirmed'
});
```

## Integration with AI Agents

The wallet integration is designed to support AI agent interactions:

1. **Portfolio Monitoring Agent**: Uses `getTokenAccountsByOwner()` to track holdings
2. **Risk Analysis Agent**: Uses `getAccountInfo()` and `getBalance()` for analysis
3. **Rebalancing Agent**: Uses wallet signing methods for transaction execution
4. **Alert Agent**: Monitors wallet state changes through the connection

## Configuration

### Environment Variables

```bash
# Optional: Custom RPC endpoint
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com

# Optional: Network selection
VITE_SOLANA_NETWORK=devnet
```

### Wallet Provider Configuration

The wallet provider can be configured in `WalletProvider.tsx`:

```tsx
// Change network
const network = WalletAdapterNetwork.Mainnet; // or Devnet, Testnet

// Custom RPC endpoint
const endpoint = 'https://your-custom-rpc-endpoint.com';

// Add/remove wallet adapters
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  // Add more wallets as needed
];
```

## Security Considerations

1. **Network Selection**: Currently set to Devnet for development
2. **Transaction Signing**: All transactions require user approval
3. **Private Key Handling**: No private keys are stored or handled by the application
4. **RPC Endpoint**: Uses public endpoints; consider private RPC for production

## Dependencies

### Web Package Dependencies
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-react-ui`
- `@solana/wallet-adapter-wallets`
- `@solana/web3.js`
- `@coral-xyz/anchor`

### Shared Package Peer Dependencies
- `@solana/web3.js`
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-base`

## Testing

To test the wallet integration:

1. Start the development server: `npm run dev`
2. Navigate to Settings > Wallet tab
3. Click "Connect Wallet" to test wallet connection
4. Use "Get SOL Balance" to test RPC functionality

## Future Enhancements

1. **Multi-network Support**: Dynamic network switching
2. **Transaction History**: Track and display transaction history
3. **Advanced Agent Operations**: More complex DeFi interactions
4. **Wallet Analytics**: Built-in portfolio analytics
5. **Hardware Wallet Support**: Enhanced Ledger integration

## Troubleshooting

### Common Issues

1. **Wallet not connecting**: Ensure wallet extension is installed and unlocked
2. **RPC errors**: Check network connection and RPC endpoint status
3. **Transaction failures**: Verify sufficient SOL for transaction fees
4. **Import errors**: Ensure all peer dependencies are installed

### Debug Tips

1. Check browser console for detailed error messages
2. Verify wallet adapter compatibility
3. Test with different wallets if issues persist
4. Ensure correct network selection (mainnet vs devnet)
