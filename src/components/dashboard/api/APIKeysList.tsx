import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { AlertCircle, Copy, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase.tsx";
import { useToast } from "@/components/ui/use-toast.ts";

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used?: string;
  permissions: string[];
}

export default function APIKeysList() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([
    "read",
  ]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockApiKeys: APIKey[] = [
    {
      id: "1",
      name: "Production API Key",
      prefix: "ak_prod_",
      created_at: "2023-10-15T14:30:00Z",
      last_used: "2023-10-28T09:15:22Z",
      permissions: ["read", "write"],
    },
    {
      id: "2",
      name: "Development API Key",
      prefix: "ak_dev_",
      created_at: "2023-10-20T11:45:00Z",
      last_used: "2023-10-27T16:30:45Z",
      permissions: ["read"],
    },
    {
      id: "3",
      name: "Testing API Key",
      prefix: "ak_test_",
      created_at: "2023-10-25T08:20:00Z",
      permissions: ["read", "write", "admin"],
    },
  ];

  useEffect(() => {
    // In a real implementation, fetch API keys from Supabase
    // For now, use mock data
    const isDeployed = localStorage.getItem("privateAiDeployed") === "true";

    if (isDeployed) {
      setApiKeys(mockApiKeys);
    } else {
      setApiKeys([]);
    }

    setIsLoading(false);
  }, []);

  const handleCreateKey = async () => {
    const isDeployed = localStorage.getItem("privateAiDeployed") === "true";

    if (!isDeployed) {
      toast({
        title: "Error",
        description: "You need to deploy your Private AI instance first",
        variant: "destructive",
      });
      return;
    }
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, create API key in Supabase
      // For now, simulate API key creation
      const newKeyPrefix = `ak_${Math.random().toString(36).substring(2, 8)}_`;
      const fullKey = `${newKeyPrefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const newKey: APIKey = {
        id: (apiKeys.length + 1).toString(),
        name: newKeyName,
        prefix: newKeyPrefix,
        created_at: new Date().toISOString(),
        permissions: newKeyPermissions,
      };

      setApiKeys([...apiKeys, newKey]);
      setNewlyCreatedKey(fullKey);
      setNewKeyName("");
      setNewKeyPermissions(["read"]);

      // Store the API key in localStorage for the API Playground to use
      localStorage.setItem("lastCreatedApiKey", fullKey);

      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const handleDeleteKey = async (id: string) => {
    setIsLoading(true);

    try {
      // In a real implementation, delete API key from Supabase
      setApiKeys(apiKeys.filter((key) => key.id !== id));

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">API Keys</CardTitle>
        <CardDescription>
          Create and manage API keys for your private AI instance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Create New API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key to access your private AI instance.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Key Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        newKeyPermissions.includes("read")
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        if (newKeyPermissions.includes("read")) {
                          setNewKeyPermissions(
                            newKeyPermissions.filter((p) => p !== "read"),
                          );
                        } else {
                          setNewKeyPermissions([...newKeyPermissions, "read"]);
                        }
                      }}
                    >
                      Read
                    </Badge>
                    <Badge
                      variant={
                        newKeyPermissions.includes("write")
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        if (newKeyPermissions.includes("write")) {
                          setNewKeyPermissions(
                            newKeyPermissions.filter((p) => p !== "write"),
                          );
                        } else {
                          setNewKeyPermissions([...newKeyPermissions, "write"]);
                        }
                      }}
                    >
                      Write
                    </Badge>
                    <Badge
                      variant={
                        newKeyPermissions.includes("admin")
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        if (newKeyPermissions.includes("admin")) {
                          setNewKeyPermissions(
                            newKeyPermissions.filter((p) => p !== "admin"),
                          );
                        } else {
                          setNewKeyPermissions([...newKeyPermissions, "admin"]);
                        }
                      }}
                    >
                      Admin
                    </Badge>
                  </div>
                </div>
              </div>
              {newlyCreatedKey && (
                <div className="mb-4 rounded-md bg-yellow-50 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This is the only time you'll see this API key. Please
                          copy it now:
                        </p>
                        <div className="mt-2 flex items-center justify-between rounded-md bg-yellow-100 p-2">
                          <code className="text-sm font-mono">
                            {newlyCreatedKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey(newlyCreatedKey)}
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewlyCreatedKey(null);
                  }}
                >
                  Close
                </Button>
                {!newlyCreatedKey && (
                  <Button onClick={handleCreateKey} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create API Key"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No API keys found. Create your first API key to get started.
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-muted-foreground" />
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {key.prefix}***
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(key.created_at)}</TableCell>
                    <TableCell>
                      {key.last_used ? formatDate(key.last_used) : "Never used"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant="secondary"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={isLoading}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
