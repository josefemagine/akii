import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, MessagesSquare, BookOpenIcon, ServerIcon } from "lucide-react";

export default function TelegramChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [agentStatus, setAgentStatus] = useState<"draft" | "active">("draft");
  const [userCount, setUserCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [commandUsage, setCommandUsage] = useState(0);
  const [botToken, setBotToken] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timeout = setTimeout(() => {
      // Check if Telegram bot is deployed (simulate from localStorage)
      const isDeployed = localStorage.getItem("telegram_bot_deployed") === "true";
      
      if (isDeployed) {
        setAgentStatus("active");
        setUserCount(234);
        setMessageCount(895);
        setCommandUsage(67);
        setBotToken("5123456789:AAHn-xqIpFvTW8kRKz33hdfsgRmFg1qwerty");
        setBotUsername("AkiiAssistantBot");
      }
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleConnect = () => {
    setLoading(true);
    
    // Simulate deployment process
    setTimeout(() => {
      setAgentStatus("active");
      setUserCount(1);
      setMessageCount(0);
      setCommandUsage(0);
      localStorage.setItem("telegram_bot_deployed", "true");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Telegram Chat Agent</h1>
        <p className="text-muted-foreground">
          Connect with users through Telegram using an AI-powered chatbot that handles inquiries 24/7.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram Bot Integration</CardTitle>
            <div className="flex items-center gap-2">
              {agentStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 hover:dark:bg-amber-900/30"
                >
                  Not Deployed
                </Badge>
              )}
              {agentStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100 hover:dark:bg-green-900/30"
                >
                  Deployed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Telegram Bot API</div>
            {agentStatus === "active" && (
              <div className="text-xs text-muted-foreground">
                Bot Username: @{botUsername}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Users</div>
                <div className="text-xl font-bold">{userCount}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Messages</div>
                <div className="text-xl font-bold">{messageCount}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Command Usage</div>
                <div className="text-xl font-bold">{commandUsage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted p-3 dark:bg-muted/50">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessagesSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted-foreground/20 p-2">
                    <p className="text-sm">/start</p>
                  </div>
                </div>
                <div className="flex items-start justify-end space-x-3">
                  <div className="rounded-lg bg-primary p-2">
                    <p className="text-sm text-primary-foreground">
                      Hello! I'm your AI assistant. I can help you with information, answer questions, or assist with tasks. How can I help you today?
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessagesSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted-foreground/20 p-2">
                    <p className="text-sm">What can you do?</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="commands">Bot Commands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Telegram Bot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Telegram Bot Token</Label>
                  <Input 
                    id="botToken" 
                    placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ" 
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    disabled={agentStatus === "active"}
                    type="password"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the token from BotFather. Don't have a token? <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Create one here</a>.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="botUsername">Bot Username</Label>
                  <div className="flex items-center">
                    <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md">@</span>
                    <Input 
                      id="botUsername" 
                      placeholder="YourBotName" 
                      value={botUsername}
                      onChange={(e) => setBotUsername(e.target.value)}
                      disabled={agentStatus === "active"}
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your bot's username (without the @).
                  </p>
                </div>
                
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4 text-blue-800 dark:text-blue-200">
                  <h4 className="font-medium mb-1">How to set up your Telegram bot</h4>
                  <ol className="list-decimal list-inside text-sm">
                    <li className="mb-1">Message @BotFather on Telegram</li>
                    <li className="mb-1">Use the /newbot command to create a new bot</li>
                    <li className="mb-1">Choose a name and username for your bot</li>
                    <li className="mb-1">Copy the HTTP API token provided by BotFather</li>
                    <li>Paste the token and username in the fields above</li>
                  </ol>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={handleConnect}
                    disabled={loading || agentStatus === "active" || !botToken || !botUsername}
                  >
                    {loading ? "Connecting..." : agentStatus === "active" ? "Connected" : "Connect Telegram Bot"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Bot Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{messageCount}</div>
                        <p className="text-xs text-muted-foreground">+30% from last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Command Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{commandUsage}%</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-medium mb-2">Top Commands</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">/start</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">/help</span>
                        <span className="text-sm font-medium">22%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">/settings</span>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">/info</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="commands">
            <Card>
              <CardHeader>
                <CardTitle>Bot Commands Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure custom commands for your Telegram bot. These commands will be suggested to users when they type "/".
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">/start</div>
                      <Badge>Default</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Start the conversation with the bot</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">/help</div>
                      <Badge>Default</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Show available commands and how to use them</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">/settings</div>
                      <Badge>Custom</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Adjust your preferences for the bot</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">/info</div>
                      <Badge>Custom</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Get information about the bot and its capabilities</p>
                  </div>
                </div>
                
                <div className="pt-3">
                  <Button variant="outline" className="w-full">
                    <SendIcon className="mr-2 h-4 w-4" />
                    Add New Command
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Apply to BotFather</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    After configuring your commands, you need to update them with BotFather.
                  </p>
                  <Button variant="outline">
                    <BookOpenIcon className="mr-2 h-4 w-4" />
                    View BotFather Instructions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 