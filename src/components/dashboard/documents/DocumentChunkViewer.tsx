import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { FileText, Edit, Trash2, Eye } from "lucide-react";

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    chunk_index: number;
    total_chunks: number;
  };
}

interface DocumentChunkViewerProps {
  documentId: string;
  documentName: string;
  chunks: DocumentChunk[];
  onEditChunk?: (chunkId: string, content: string) => void;
  onDeleteChunk?: (chunkId: string) => void;
}

const DocumentChunkViewer = ({
  documentId,
  documentName = "Untitled Document",
  chunks = [],
  onEditChunk = () => {},
  onDeleteChunk = () => {},
}: DocumentChunkViewerProps) => {
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(
    chunks.length > 0 ? chunks[0].id : null,
  );

  const selectedChunk = chunks.find((chunk) => chunk.id === selectedChunkId);

  return (
    <Card className="w-full bg-white shadow-sm border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {documentName}
        </CardTitle>
        <CardDescription>
          Document has been processed into {chunks.length} chunks for training
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chunks List */}
          <div className="md:col-span-1 border rounded-md">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium">Document Chunks</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className={`p-3 mb-2 rounded-md cursor-pointer hover:bg-gray-50 ${selectedChunkId === chunk.id ? "bg-gray-100 border border-gray-200" : ""}`}
                    onClick={() => setSelectedChunkId(chunk.id)}
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        Chunk {chunk.metadata.chunk_index + 1} of{" "}
                        {chunk.metadata.total_chunks}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChunk(chunk.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {chunk.content.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chunk Content */}
          <div className="md:col-span-2 border rounded-md">
            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium">
                {selectedChunk
                  ? `Chunk ${selectedChunk.metadata.chunk_index + 1} Content`
                  : "Select a chunk to view"}
              </h3>
              {selectedChunk && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onEditChunk(selectedChunk.id, selectedChunk.content)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              )}
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {selectedChunk ? (
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {selectedChunk.content}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a chunk to view its content</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentChunkViewer;
