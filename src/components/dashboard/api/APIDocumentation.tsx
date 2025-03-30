import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function APIDocumentation() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">API Documentation</CardTitle>
        <CardDescription>
          Reference documentation for your private AI API endpoints.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">Chat API</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                Your private AI API provides a set of endpoints for integrating
                AI capabilities into your applications. All API requests require
                authentication using your API key.
              </p>

              <div className="mt-4 rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Base URL</h4>
                <div className="flex items-center justify-between rounded-md bg-background p-2">
                  <code className="text-xs font-mono">
                    https://api.akii.com/v1/your-org-id
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyCode("https://api.akii.com/v1/your-org-id")
                    }
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Authentication</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  All API requests require an API key to be included in the
                  Authorization header:
                </p>
                <div className="flex items-center justify-between rounded-md bg-background p-2">
                  <code className="text-xs font-mono">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyCode("Authorization: Bearer YOUR_API_KEY")
                    }
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <h3 className="text-lg font-semibold">Available Endpoints</h3>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                        POST
                      </span>
                      <span className="font-mono text-sm">/api/v1/chat</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("chat")}
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Generate chat completions with your private AI model.
                  </p>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                        POST
                      </span>
                      <span className="font-mono text-sm">
                        /api/v1/embeddings
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("embeddings")}
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Generate vector embeddings for text inputs.
                  </p>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                        POST
                      </span>
                      <span className="font-mono text-sm">
                        /api/v1/documents
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("documents")}
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload and process documents for your knowledge base.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink size={16} />
                Full API Reference
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Chat Completions API</h3>
              <p className="text-sm text-muted-foreground">
                Generate chat completions with your private AI model. This
                endpoint is compatible with the OpenAI Chat API format.
              </p>

              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                    POST
                  </span>
                  <code className="font-mono text-sm">/api/v1/chat</code>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Request Body</h4>
                <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(
                      {
                        messages: [
                          {
                            role: "system",
                            content: "You are a helpful AI assistant.",
                          },
                          {
                            role: "user",
                            content: "Hello, can you help me with a question?",
                          },
                        ],
                        model: "akii-standard-1",
                        temperature: 0.7,
                        max_tokens: 150,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleCopyCode(
                      JSON.stringify(
                        {
                          messages: [
                            {
                              role: "system",
                              content: "You are a helpful AI assistant.",
                            },
                            {
                              role: "user",
                              content:
                                "Hello, can you help me with a question?",
                            },
                          ],
                          model: "akii-standard-1",
                          temperature: 0.7,
                          max_tokens: 150,
                        },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  <Copy size={14} className="mr-2" />
                  Copy Request
                </Button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Response</h4>
                <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(
                      {
                        id: "resp_abc123",
                        object: "chat.completion",
                        created: 1677858242,
                        model: "akii-standard-1",
                        choices: [
                          {
                            index: 0,
                            message: {
                              role: "assistant",
                              content:
                                "Hello! I'm your private AI assistant. I'd be happy to help with your question. What would you like to know?",
                            },
                            finish_reason: "stop",
                          },
                        ],
                        usage: {
                          prompt_tokens: 29,
                          completion_tokens: 24,
                          total_tokens: 53,
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleCopyCode(
                      JSON.stringify(
                        {
                          id: "resp_abc123",
                          object: "chat.completion",
                          created: 1677858242,
                          model: "akii-standard-1",
                          choices: [
                            {
                              index: 0,
                              message: {
                                role: "assistant",
                                content:
                                  "Hello! I'm your private AI assistant. I'd be happy to help with your question. What would you like to know?",
                              },
                              finish_reason: "stop",
                            },
                          ],
                          usage: {
                            prompt_tokens: 29,
                            completion_tokens: 24,
                            total_tokens: 53,
                          },
                        },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  <Copy size={14} className="mr-2" />
                  Copy Response
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embeddings" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Embeddings API</h3>
              <p className="text-sm text-muted-foreground">
                Generate vector embeddings for text inputs. These embeddings can
                be used for semantic search, clustering, and other NLP tasks.
              </p>

              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                    POST
                  </span>
                  <code className="font-mono text-sm">/api/v1/embeddings</code>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Request Body</h4>
                <ScrollArea className="h-40 w-full rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(
                      {
                        input: "The quick brown fox jumps over the lazy dog",
                        model: "akii-embedding-1",
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleCopyCode(
                      JSON.stringify(
                        {
                          input: "The quick brown fox jumps over the lazy dog",
                          model: "akii-embedding-1",
                        },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  <Copy size={14} className="mr-2" />
                  Copy Request
                </Button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Response</h4>
                <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(
                      {
                        object: "embedding",
                        data: [
                          {
                            object: "embedding",
                            embedding: [
                              0.0023064255, -0.009327292, -0.0028842222,
                              // ... (truncated for brevity)
                              0.01851064, 0.008510631, 0.019030416,
                            ],
                            index: 0,
                          },
                        ],
                        model: "akii-embedding-1",
                        usage: {
                          prompt_tokens: 8,
                          total_tokens: 8,
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Documents API</h3>
              <p className="text-sm text-muted-foreground">
                Upload and process documents for your knowledge base. This API
                allows you to add documents to your private AI's knowledge base
                for retrieval and context.
              </p>

              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2">
                    POST
                  </span>
                  <code className="font-mono text-sm">/api/v1/documents</code>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  Request Body (multipart/form-data)
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This endpoint accepts multipart/form-data with the following
                  fields:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li>
                    <strong>file:</strong> The document file (PDF, DOCX, TXT,
                    etc.)
                  </li>
                  <li>
                    <strong>collection_id:</strong> (Optional) The ID of the
                    collection to add the document to
                  </li>
                  <li>
                    <strong>metadata:</strong> (Optional) JSON string with
                    metadata about the document
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Response</h4>
                <ScrollArea className="h-40 w-full rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(
                      {
                        id: "doc_abc123",
                        object: "document",
                        created: 1677858242,
                        filename: "product_manual.pdf",
                        size_bytes: 1245678,
                        status: "processing",
                        collection_id: "col_xyz789",
                        metadata: {
                          title: "Product Manual",
                          category: "Technical Documentation",
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
