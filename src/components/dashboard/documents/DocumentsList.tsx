import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  FileText,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import DocumentUploader from "./DocumentUploader";
import DocumentChunkViewer from "./DocumentChunkViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Database } from "@/types/supabase";
import { DocumentChunk } from "@/types/custom";

type Document = Database["public"]["Tables"]["training_documents"]["Row"];

const DocumentsList = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentChunks, setDocumentChunks] = useState<DocumentChunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [showChunkViewer, setShowChunkViewer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("training_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data as any || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentChunks = async (documentId: string) => {
    try {
      setIsLoadingChunks(true);
      const { data: chunks, error: chunksError } = await supabase
        .from("document_chunks")
        .select("*")
        .eq("document_id", documentId);

      if (chunksError) throw chunksError;
      const processedChunks = ((chunks || []) as any[]).map((chunk) => ({
        ...chunk,
        metadata: chunk.metadata as { chunk_index: number; total_chunks: number }
      }));
      
      setDocumentChunks(processedChunks);
    } catch (error) {
      console.error("Error fetching document chunks:", error);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleViewDocument = async (document: Document) => {
    setSelectedDocument(document);
    await fetchDocumentChunks(document.id);
    setShowChunkViewer(true);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      // Delete document chunks
      const { error: chunksError } = await supabase
        .from("document_chunks")
        .delete()
        .eq("document_id", id);

      if (chunksError) throw chunksError;

      // Get document to find file path
      const { data: documentData, error: docError } = await supabase
        .from("training_documents")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (docError) throw docError;

      // Delete file from storage
      const filePath = (documentData as any)?.storage_path;
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Delete document record
      const { error: deleteError } = await supabase
        .from("training_documents")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDownload = async (document: Document) => {
    if (!document.storage_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(document.storage_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.storage_path.split("/").pop() || "document";
      window.document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "uploading":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            Uploading
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Documents</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowUploader(true)} variant="default">
              Upload Document
            </Button>
            <Button
              onClick={fetchDocuments}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No documents
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload your first document to get started.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowUploader(true)}
              >
                Upload Document
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No results found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No documents matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{doc.title}</span>
                          {doc.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                              {doc.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        {doc.file_type ? (
                          <span className="text-xs uppercase">
                            {doc.file_type.split("/")[1] || doc.file_type}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.file_size
                          ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(doc.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doc.status === "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleViewDocument(doc)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Chunks</span>
                              </DropdownMenuItem>
                            )}
                            {doc.storage_path && (
                              <DropdownMenuItem
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setDocumentToDelete(doc.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Uploader Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to use for training your AI agent.
            </DialogDescription>
          </DialogHeader>
          <DocumentUploader
            onUploadComplete={() => {
              setShowUploader(false);
              fetchDocuments();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Document Chunks Viewer Dialog */}
      <Dialog open={showChunkViewer} onOpenChange={setShowChunkViewer}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Chunks</DialogTitle>
            <DialogDescription>
              View how your document has been processed into chunks for
              training.
            </DialogDescription>
          </DialogHeader>
          {isLoadingChunks ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            selectedDocument && (
              <DocumentChunkViewer
                documentId={selectedDocument.id}
                documentName={selectedDocument.title}
                chunks={documentChunks}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document and all associated
              chunks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (documentToDelete) {
                  handleDeleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                }
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentsList;
