import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Database,
  Link2,
  FileUp,
  Search,
  Tag,
  AlertCircle,
  Copy,
} from "lucide-react";

interface TrainingDataSelectorProps {
  onDataSelected?: (data: TrainingDataItem[]) => void;
  existingData?: TrainingDataItem[];
}

interface TrainingDataItem {
  id: string;
  name: string;
  type: "document" | "database" | "api" | "zapier";
  size?: string;
  status?: "processing" | "ready" | "error";
  progress?: number;
  dateAdded?: string;
  tags?: string[];
}

const TrainingDataSelector: React.FC<TrainingDataSelectorProps> = ({
  onDataSelected = () => {},
  existingData = [],
}) => {
  const [selectedData, setSelectedData] =
    useState<TrainingDataItem[]>(existingData);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for demonstration
  const availableData: TrainingDataItem[] = [
    {
      id: "doc-1",
      name: "Product Documentation.pdf",
      type: "document",
      size: "2.4 MB",
      status: "ready",
      dateAdded: "2023-06-15",
      tags: ["documentation", "product"],
    },
    {
      id: "doc-2",
      name: "FAQ Knowledge Base.docx",
      type: "document",
      size: "1.8 MB",
      status: "ready",
      dateAdded: "2023-06-10",
      tags: ["faq", "support"],
    },
    {
      id: "db-1",
      name: "Customer Support Tickets",
      type: "database",
      status: "ready",
      dateAdded: "2023-06-05",
      tags: ["support", "tickets"],
    },
    {
      id: "api-1",
      name: "Product API Documentation",
      type: "api",
      status: "ready",
      dateAdded: "2023-05-28",
      tags: ["api", "technical"],
    },
    {
      id: "zap-1",
      name: "Zendesk Support Tickets",
      type: "zapier",
      status: "processing",
      progress: 65,
      dateAdded: "2023-06-18",
      tags: ["zapier", "zendesk"],
    },
  ];

  const filteredData = availableData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const handleDataToggle = (item: TrainingDataItem) => {
    setSelectedData((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      if (isSelected) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleUpload = () => {
    // Simulate file upload
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Add mock uploaded file to selected data
          const newFile: TrainingDataItem = {
            id: `doc-${Date.now()}`,
            name: "Uploaded Document.pdf",
            type: "document",
            size: "3.2 MB",
            status: "processing",
            progress: 0,
            dateAdded: new Date().toISOString().split("T")[0],
            tags: ["new", "uploaded"],
          };
          setSelectedData((prev) => [...prev, newFile]);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSaveSelection = () => {
    onDataSelected(selectedData);
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6">Training Data Selection</h2>
      <p className="text-muted-foreground mb-6">
        Select existing data sources or upload new documents to train your AI
        agent. The more relevant data you provide, the better your agent will
        perform.
      </p>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4 mb-6">
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Existing Data
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="zapier" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Zapier Integration
          </TabsTrigger>
          <TabsTrigger value="selected" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Selected ({selectedData.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or tag..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all ${selectedData.some((i) => i.id === item.id) ? "ring-2 ring-primary" : ""}`}
                onClick={() => handleDataToggle(item)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>
                        {item.type === "document" ? `${item.size} • ` : ""}
                        Added on {item.dateAdded}
                      </CardDescription>
                    </div>
                    {item.status === "processing" && (
                      <div className="text-amber-500 text-xs font-medium flex items-center gap-1">
                        <span>Processing</span>
                        {item.progress && (
                          <Progress
                            value={item.progress}
                            className="w-16 h-1.5"
                          />
                        )}
                      </div>
                    )}
                    {item.status === "error" && (
                      <div className="text-destructive text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Error</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((tag) => (
                      <div
                        key={tag}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    {item.type === "document" && (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {item.type === "database" && (
                      <Database className="h-3 w-3 mr-1" />
                    )}
                    {item.type === "api" && (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {item.type === "zapier" && (
                      <Link2 className="h-3 w-3 mr-1" />
                    )}
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No data sources found matching your search criteria.</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Drag and drop files here
                </h3>
                <p className="text-muted-foreground mb-4">
                  Supported formats: PDF, DOCX, TXT, CSV, JSON (Max 50MB)
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleUpload} disabled={isUploading}>
                    <FileUp className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Select Files"}
                  </Button>
                  <Button variant="outline" disabled={isUploading}>
                    Paste URL
                  </Button>
                </div>
                {isUploading && (
                  <div className="mt-6">
                    <p className="text-sm mb-2">Uploading document...</p>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Upload Options</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">PII Redaction</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect and redact personal information
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Document Chunking</h4>
                    <p className="text-sm text-muted-foreground">
                      Control how documents are split for processing
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-tagging</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate tags for uploaded content
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect with Zapier</CardTitle>
              <CardDescription>
                Import data from any of your favorite tools using Zapier
                integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <Link2 className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Zapier Integration</h3>
                <p className="text-muted-foreground mb-6 max-w-md text-center">
                  Connect to Zendesk, Intercom, Salesforce, and more to
                  automatically import training data.
                </p>
                <div className="flex gap-3">
                  <Button>
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Zapier
                  </Button>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Zapier Connection Status</h4>
                <div className="flex items-center gap-2 text-amber-500">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Not Connected</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Connect your Zapier account to start importing data
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Popular Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center py-6">
                  <img
                    src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&q=80"
                    alt="Zendesk"
                    className="w-12 h-12 mx-auto mb-2 rounded"
                  />
                  <h4 className="font-medium">Zendesk</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Import support tickets
                  </p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center py-6">
                  <img
                    src="https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&q=80"
                    alt="Salesforce"
                    className="w-12 h-12 mx-auto mb-2 rounded"
                  />
                  <h4 className="font-medium">Salesforce</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Import customer data
                  </p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center py-6">
                  <img
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&q=80"
                    alt="Intercom"
                    className="w-12 h-12 mx-auto mb-2 rounded"
                  />
                  <h4 className="font-medium">Intercom</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Import chat history
                  </p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configure Zapier Zaps</CardTitle>
              <CardDescription>
                Set up automated workflows to import data from your tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Create a Zap</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow these steps to create a Zap that imports data to your
                    AI agent
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Log in to your Zapier account</li>
                    <li>
                      Create a new Zap with your desired trigger (e.g., new
                      Zendesk ticket)
                    </li>
                    <li>Add Akii as an action app</li>
                    <li>Select "Add Training Data" as the action</li>
                    <li>Configure the data mapping</li>
                    <li>Test and activate your Zap</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">API Key</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this API key when connecting Akii in Zapier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          {selectedData.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {selectedData.length} Data Sources Selected
                </h3>
                <Button variant="outline" onClick={() => setSelectedData([])}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-2">
                {selectedData.map((item) => (
                  <Card key={item.id} className="flex items-center p-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {item.type === "document" && (
                          <FileText className="h-3 w-3 mr-1" />
                        )}
                        {item.type === "database" && (
                          <Database className="h-3 w-3 mr-1" />
                        )}
                        {item.type === "api" && (
                          <FileText className="h-3 w-3 mr-1" />
                        )}
                        {item.type === "zapier" && (
                          <Link2 className="h-3 w-3 mr-1" />
                        )}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        {item.size && ` • ${item.size}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDataToggle(item)}
                    >
                      Remove
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No data sources selected yet.</p>
              <p className="text-sm">
                Select data from the Existing Data tab or upload new files.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSaveSelection}
          disabled={selectedData.length === 0}
        >
          Save Selection
        </Button>
      </div>
    </div>
  );
};

export default TrainingDataSelector;
