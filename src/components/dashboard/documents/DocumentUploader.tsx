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
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

const DocumentUploader = ({
  onUploadComplete = () => {},
}: DocumentUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
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

    try {
      // Create document record first
      const { data: document, error: documentError } = await supabase
        .from("training_documents")
        .insert({
          user_id: user.id,
          title,
          description,
          status: "pending",
          file_path: "",
          file_type: "",
          file_size: 0,
        } as any)
        .select()
        .single();

      if (documentError) throw documentError;

      // Upload each file to storage
      for (const file of files) {
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(`${user.id}/${document.id}/${file.name}`, file);

        if (uploadError) throw uploadError;

        // Update document with file info
        const { error: updateError } = await supabase
          .from("training_documents")
          .update({
            file_path: `${user.id}/${document.id}/${file.name}`,
            file_type: file.type,
            file_size: file.size,
            status: "processing",
          } as any)
          .eq("id", document.id);

        if (updateError) throw updateError;

        // Trigger document processing
        const { error: functionError } = await supabase.functions.invoke(
          "process-document",
          {
            body: { documentId: document.id },
          }
        );

        if (functionError) throw functionError;
      }

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Files</Label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
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
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
