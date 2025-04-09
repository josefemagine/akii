import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

interface DocumentUploadResponse {
  id: string;
  title: string;
  status: string;
  success: boolean;
  message?: string;
}

const DocumentUploader = ({
  onUploadComplete = () => {},
}: DocumentUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Filter out files larger than 10MB
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB and cannot be uploaded.`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });
      
      setFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to upload documents");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for your document");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create document record first using the edge function
      const createResponse = await invokeServerFunction<DocumentUploadResponse>("create_document", {
        userId: user.id,
        title,
        description,
      });

      if (!createResponse || !createResponse.success) {
        throw new Error(createResponse?.message || "Failed to create document record");
      }

      const documentId = createResponse.id;
      
      // Upload each file to storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${user.id}/${documentId}/${file.name}`;
        
        // Calculate progress
        const progressPerFile = 100 / files.length;
        const currentFileProgress = (i / files.length) * 100;
        setUploadProgress(currentFileProgress);
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Update document with file info and initiate processing
        const updateResponse = await invokeServerFunction<{success: boolean, message?: string}>("update_document_file", {
          documentId,
          userId: user.id,
          filePath,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        });
        
        if (!updateResponse || !updateResponse.success) {
          throw new Error(updateResponse?.message || "Failed to update document with file info");
        }
        
        setUploadProgress(currentFileProgress + progressPerFile * 0.5);
      }
      
      // Trigger document processing
      const processingResponse = await invokeServerFunction<{success: boolean, message?: string}>("process_document", {
        documentId,
        userId: user.id
      });
      
      if (!processingResponse || !processingResponse.success) {
        throw new Error(processingResponse?.message || "Failed to start document processing");
      }

      setUploadProgress(100);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document is now being processed for training.",
      });

      // Reset form
      setFiles([]);
      setTitle("");
      setDescription("");
      onUploadComplete();
    } catch (err: any) {
      console.error("Error uploading document:", err);
      setError(err.message || "Failed to upload document");
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Training Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for your document"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Files</Label>
              <div
                className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => !isUploading && document.getElementById("file-upload")?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, DOCX, TXT, CSV (max 10MB each)
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.csv"
                  multiple
                  disabled={isUploading}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Upload Progress</Label>
                  <span className="text-xs">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <CardFooter className="flex justify-end px-0 pt-4">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
