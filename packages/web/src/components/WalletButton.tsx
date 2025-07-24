import React from 'react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
// import { useSolana } from '@org/shared'; // Temporarily disabled for smoke test
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const WalletButton: React.FC = () => {
  // Simplified version for smoke test
  const connected = false; // Mock for now
  const connecting = false;
  const publicKey = null;
  
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleGetBalance = async () => {
    // Mock implementation for smoke test
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalance(1.2345); // Mock balance
    } catch (error) {
      console.error('Failed to get balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Solana Wallet Connection</CardTitle>
        <CardDescription>
          Connect your wallet to interact with Solana agents (Smoke Test Mode)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          {!connected ? (
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
          ) : (
            <div className="space-y-2">
              <WalletDisconnectButton className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90" />
              <div className="text-sm">
                <p className="font-medium">Connected:</p>
                <p className="font-mono text-xs break-all">
                  {publicKey?.toString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleGetBalance} 
            disabled={loading || connecting}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Test Get SOL Balance'}
          </Button>
          
          {balance !== null && (
            <div className="text-sm p-2 bg-muted rounded">
              <p><strong>Balance (Mock):</strong> {balance.toFixed(4)} SOL</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletButton;
