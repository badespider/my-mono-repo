import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import WalletButton from "@/components/WalletButton";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Wallet,
  Bot,
  Save,
  RefreshCw
} from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Settings Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your AI portfolio tracker preferences</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button variant="agent" size="sm">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Content */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="notifications">Alerts</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="portfolio-name">Portfolio Name</Label>
                        <Input id="portfolio-name" placeholder="My AI Portfolio" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                        <Input id="refresh-interval" type="number" placeholder="30" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Use dark theme interface</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Real-time Updates</Label>
                          <p className="text-sm text-muted-foreground">Enable live data streaming</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sound Notifications</Label>
                          <p className="text-sm text-muted-foreground">Play sounds for important alerts</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Agent Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Monitoring Agent */}
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Portfolio Monitoring Agent</h4>
                        <Switch defaultChecked />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="monitor-interval">Check Interval (minutes)</Label>
                          <Input id="monitor-interval" type="number" placeholder="5" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monitor-threshold">Alert Threshold (%)</Label>
                          <Input id="monitor-threshold" type="number" placeholder="5.0" />
                        </div>
                      </div>
                    </div>

                    {/* Analysis Agent */}
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Risk Analysis Agent</h4>
                        <Switch defaultChecked />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="analysis-interval">Analysis Interval (hours)</Label>
                          <Input id="analysis-interval" type="number" placeholder="1" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="risk-threshold">Max Risk Level (%)</Label>
                          <Input id="risk-threshold" type="number" placeholder="15.0" />
                        </div>
                      </div>
                    </div>

                    {/* Rebalancing Agent */}
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Auto Rebalancing Agent</h4>
                        <Switch />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rebalance-threshold">Rebalance Threshold (%)</Label>
                          <Input id="rebalance-threshold" type="number" placeholder="5.0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-trade-size">Max Trade Size (%)</Label>
                          <Input id="max-trade-size" type="number" placeholder="10.0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Portfolio Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of significant portfolio changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Agent Status Updates</Label>
                        <p className="text-sm text-muted-foreground">Notifications when agents start/stop/error</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Trade Execution Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify when trades are executed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">Alerts for significant price movements</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Health Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notifications for system issues</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" placeholder="••••••••••••••••" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeout-duration">Timeout Duration (minutes)</Label>
                      <Input id="timeout-duration" type="number" placeholder="30" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Wallet Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Wallet Connection */}
                    <div className="flex justify-center">
                      <WalletButton />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-address">Primary Wallet Address</Label>
                        <Input id="wallet-address" placeholder="Enter Solana wallet address" />
                      </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slippage">Max Slippage (%)</Label>
                      <Input id="slippage" type="number" placeholder="1.0" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gas-price">Gas Price Priority</Label>
                      <Input id="gas-price" placeholder="Medium" />
                    </div>
                    
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-approve Small Transactions</Label>
                          <p className="text-sm text-muted-foreground">Skip confirmation for trades under $100</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;