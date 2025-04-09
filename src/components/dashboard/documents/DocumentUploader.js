var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";
const DocumentUploader = ({ onUploadComplete = () => { }, }) => {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const handleFileChange = (e) => {
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
    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
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
            const createResponse = yield invokeServerFunction("create_document", {
                userId: user.id,
                title,
                description,
            });
            if (!createResponse || !createResponse.success) {
                throw new Error((createResponse === null || createResponse === void 0 ? void 0 : createResponse.message) || "Failed to create document record");
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
                const { error: uploadError } = yield supabase.storage
                    .from("documents")
                    .upload(filePath, file);
                if (uploadError)
                    throw uploadError;
                // Update document with file info and initiate processing
                const updateResponse = yield invokeServerFunction("update_document_file", {
                    documentId,
                    userId: user.id,
                    filePath,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
                if (!updateResponse || !updateResponse.success) {
                    throw new Error((updateResponse === null || updateResponse === void 0 ? void 0 : updateResponse.message) || "Failed to update document with file info");
                }
                setUploadProgress(currentFileProgress + progressPerFile * 0.5);
            }
            // Trigger document processing
            const processingResponse = yield invokeServerFunction("process_document", {
                documentId,
                userId: user.id
            });
            if (!processingResponse || !processingResponse.success) {
                throw new Error((processingResponse === null || processingResponse === void 0 ? void 0 : processingResponse.message) || "Failed to start document processing");
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
        }
        catch (err) {
            console.error("Error uploading document:", err);
            setError(err.message || "Failed to upload document");
            toast({
                title: "Upload failed",
                description: err.message || "Failed to upload document. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsUploading(false);
        }
    });
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Upload Training Documents" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", children: "Document Title" }), _jsx(Input, { id: "title", placeholder: "Enter a title for your document", value: title, onChange: (e) => setTitle(e.target.value), required: true, disabled: isUploading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description (Optional)" }), _jsx(Textarea, { id: "description", placeholder: "Enter a description for your document", value: description, onChange: (e) => setDescription(e.target.value), rows: 3, disabled: isUploading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "file", children: "Upload Files" }), _jsxs("div", { className: `border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'}`, onClick: () => { var _a; return !isUploading && ((_a = document.getElementById("file-upload")) === null || _a === void 0 ? void 0 : _a.click()); }, children: [_jsx(Upload, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500", children: "PDF, DOCX, TXT, CSV (max 10MB each)" }), _jsx(Input, { id: "file-upload", type: "file", className: "hidden", onChange: handleFileChange, accept: ".pdf,.docx,.txt,.csv", multiple: true, disabled: isUploading })] })] }), files.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Selected Files" }), _jsx("div", { className: "space-y-2", children: files.map((file, index) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-500" }), _jsx("span", { className: "text-sm truncate max-w-[200px]", children: file.name }), _jsxs("span", { className: "text-xs text-gray-500", children: [(file.size / 1024 / 1024).toFixed(2), " MB"] })] }), !isUploading && (_jsxs(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeFile(index), children: [_jsx(X, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Remove file" })] }))] }, index))) })] })), isUploading && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { children: "Upload Progress" }), _jsxs("span", { className: "text-xs", children: [Math.round(uploadProgress), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700", children: _jsx("div", { className: "bg-primary h-2.5 rounded-full transition-all duration-300", style: { width: `${uploadProgress}%` } }) })] })), error && (_jsxs("div", { className: "flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx("span", { children: error })] }))] }), _jsx(CardFooter, { className: "flex justify-end px-0 pt-4", children: _jsx(Button, { type: "submit", disabled: isUploading, children: isUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Uploading..."] })) : ("Upload Document") }) })] }) })] }));
};
export default DocumentUploader;
