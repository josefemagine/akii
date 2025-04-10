import React, { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Copy, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  permissions: string[];
  enabled: boolean;
}

const APIKeys = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "key-1",
      name: "Production API Key",
      key: "ak_live_" + Math.random().toString(36).substring(2, 15),
      created: "2023-10-15T10:30:00Z",
      lastUsed: "2023-10-20T14:22:10Z",
      permissions: ["read", "write"],
      enabled: true,
    },
    {
      id: "key-2",
      name: "Development API Key",
      key: "ak_dev_" + Math.random().toString(36).substring(2, 15),
      created: "2023-10-16T09:15:00Z",
      lastUsed: null,
      permissions: ["read"],
      enabled: true,
    },
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([
    "read",
  ]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleTogglePermission = (permission: string) => {
    if (newKeyPermissions.includes(permission)) {
      setNewKeyPermissions(newKeyPermissions.filter((p) => p !== permission));
    } else {
      setNewKeyPermissions([...newKeyPermissions, permission]);
    }
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast({
        title: "Error",
        description: "Please provide a name for your API key.",
        variant: "destructive",
      });
      return;
    }

    const newKey: APIKey = {
      id: `key-${apiKeys.length + 1}`,
      name: newKeyName,
      key: `ak_${newKeyPermissions.includes("write") ? "live" : "dev"}_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString(),
      lastUsed: null,
      permissions: newKeyPermissions,
      enabled: true,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setNewKeyPermissions(["read"]);

    toast({
      title: "API Key Created",
      description: "Your new API key has been created successfully.",
    });
  };

  const handleRotateKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id
          ? {
              ...key,
              key: `ak_${key.permissions.includes("write") ? "live" : "dev"}_${Math.random().toString(36).substring(2, 15)}`,
            }
          : key,
      ),
    );

    toast({
      title: "API Key Rotated",
      description: "Your API key has been rotated successfully.",
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));

    toast({
      title: "API Key Deleted",
      description: "Your API key has been deleted successfully.",
    });
  };

  const handleToggleKey = (id: string, enabled: boolean) => {
    setApiKeys(
      apiKeys.map((key) => (key.id === id ? { ...key, enabled } : key)),
    );

    toast({
      title: enabled ? "API Key Enabled" : "API Key Disabled",
      description: `Your API key has been ${enabled ? "enabled" : "disabled"} successfully.`,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Keys</h1>
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="read-permission"
                        checked={newKeyPermissions.includes("read")}
                        onCheckedChange={() => handleTogglePermission("read")}
                      />
                      <Label htmlFor="read-permission">Read</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="write-permission"
                        checked={newKeyPermissions.includes("write")}
                        onCheckedChange={() => handleTogglePermission("write")}
                      />
                      <Label htmlFor="write-permission">Write</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreateKey} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1 mb-4 sm:mb-0">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{apiKey.name}</span>
                        {!apiKey.enabled && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {apiKey.key.substring(0, 10)}...{" "}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(apiKey.created)} • Last used:{" "}
                        {formatDate(apiKey.lastUsed)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {apiKey.permissions.includes("read") && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                            Read
                          </span>
                        )}
                        {apiKey.permissions.includes("write") && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                            Write
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <Switch
                          id={`toggle-${apiKey.id}`}
                          checked={apiKey.enabled}
                          onCheckedChange={(checked) =>
                            handleToggleKey(apiKey.id, checked)
                          }
                        />
                        <Label
                          htmlFor={`toggle-${apiKey.id}`}
                          className="text-sm"
                        >
                          {apiKey.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRotateKey(apiKey.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Rotate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No API keys found. Create your first API key to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage & Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Current Plan: Free</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Your current plan includes:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>1,000 API calls per month</li>
                      <li>2 API keys</li>
                      <li>Basic rate limiting</li>
                      <li>Standard support</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Usage This Month</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Calls</span>
                        <span>350 / 1,000</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Keys</span>
                        <span>{apiKeys.length} / 2</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(apiKeys.length / 2) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full sm:w-auto">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Webhooks allow your application to receive real-time updates
                  about events in your Akii account.
                </p>

                <div className="border rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No Webhooks Configured
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't set up any webhooks yet. Webhooks let you
                    receive notifications when certain events occur.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIKeys;
