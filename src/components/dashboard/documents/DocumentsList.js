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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Search, FileText, MoreVertical, Trash2, Eye, Download, CheckCircle, Clock, AlertCircle, Loader2, } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useToast } from "@/components/ui/use-toast";
import DocumentUploader from "./DocumentUploader";
import DocumentChunkViewer from "./DocumentChunkViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { invokeServerFunction } from "@/utils/supabase/functions";
const DocumentsList = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentChunks, setDocumentChunks] = useState([]);
    const [isLoadingChunks, setIsLoadingChunks] = useState(false);
    const [showChunkViewer, setShowChunkViewer] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const fetchDocuments = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user)
            return;
        try {
            setIsLoading(true);
            const data = yield invokeServerFunction("get_user_documents", {
                userId: user.id
            });
            if (data === null || data === void 0 ? void 0 : data.documents) {
                setDocuments(data.documents);
            }
            else {
                setDocuments([]);
            }
        }
        catch (error) {
            console.error("Error fetching documents:", error);
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const fetchDocumentChunks = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsLoadingChunks(true);
            const data = yield invokeServerFunction("get_document_chunks", {
                documentId
            });
            if (data === null || data === void 0 ? void 0 : data.chunks) {
                setDocumentChunks(data.chunks);
            }
            else {
                setDocumentChunks([]);
            }
        }
        catch (error) {
            console.error("Error fetching document chunks:", error);
            toast({
                title: "Error",
                description: "Failed to load document chunks",
                variant: "destructive"
            });
        }
        finally {
            setIsLoadingChunks(false);
        }
    });
    const handleViewDocument = (document) => __awaiter(void 0, void 0, void 0, function* () {
        setSelectedDocument(document);
        yield fetchDocumentChunks(document.id);
        setShowChunkViewer(true);
    });
    const handleDeleteDocument = (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield invokeServerFunction("delete_document", {
                documentId: id,
                userId: user === null || user === void 0 ? void 0 : user.id
            });
            if (!response || !response.success) {
                throw new Error((response === null || response === void 0 ? void 0 : response.message) || "Failed to delete document");
            }
            toast({
                title: "Document deleted",
                description: "Document and associated chunks have been deleted successfully"
            });
            // Refresh documents list
            fetchDocuments();
        }
        catch (error) {
            console.error("Error deleting document:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete document",
                variant: "destructive"
            });
        }
    });
    const handleDownload = (document) => __awaiter(void 0, void 0, void 0, function* () {
        if (!document.storage_path)
            return;
        try {
            const { data, error } = yield supabase.storage
                .from("documents")
                .download(document.storage_path);
            if (error)
                throw error;
            // Create a download link
            const url = URL.createObjectURL(data);
            const a = window.document.createElement("a");
            a.href = url;
            a.download = document.file_name || document.storage_path.split("/").pop() || "document";
            window.document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
            toast({
                title: "Download started",
                description: `Downloading ${document.file_name || 'document'}`
            });
        }
        catch (error) {
            console.error("Error downloading document:", error);
            toast({
                title: "Download failed",
                description: "Failed to download the document",
                variant: "destructive"
            });
        }
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (_jsxs(Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200", children: [_jsx(Clock, { className: "mr-1 h-3 w-3" }), "Pending"] }));
            case "uploading":
                return (_jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200", children: [_jsx(Clock, { className: "mr-1 h-3 w-3" }), "Uploading"] }));
            case "processing":
                return (_jsxs(Badge, { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200", children: [_jsx(Loader2, { className: "mr-1 h-3 w-3 animate-spin" }), "Processing"] }));
            case "completed":
                return (_jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Completed"] }));
            case "failed":
                return (_jsxs(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200", children: [_jsx(AlertCircle, { className: "mr-1 h-3 w-3" }), "Failed"] }));
            default:
                return _jsx(Badge, { variant: "outline", children: status });
        }
    };
    const filteredDocuments = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description &&
            doc.description.toLowerCase().includes(searchQuery.toLowerCase())));
    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);
    return (_jsxs(_Fragment, { children: [_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { children: "Your Documents" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" }), _jsx(Input, { type: "search", placeholder: "Search documents...", className: "pl-8 w-[250px]", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(Button, { onClick: () => setShowUploader(true), variant: "default", children: "Upload Document" }), _jsx(Button, { onClick: fetchDocuments, variant: "outline", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Refreshing..."] })) : ("Refresh") })] })] }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 text-primary animate-spin" }) })) : documents.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900 dark:text-gray-100", children: "No documents" }), _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Upload your first document to get started." }), _jsx(Button, { variant: "outline", className: "mt-4", onClick: () => setShowUploader(true), children: "Upload Document" })] })) : filteredDocuments.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Search, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900 dark:text-gray-100", children: "No results found" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: ["No documents matching \"", searchQuery, "\""] })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Title" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Size" }), _jsx(TableHead, { children: "Uploaded" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredDocuments.map((doc) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: doc.title }), doc.description && (_jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 truncate max-w-[300px]", children: doc.description }))] }) }), _jsx(TableCell, { children: getStatusBadge(doc.status) }), _jsx(TableCell, { children: doc.file_type ? (_jsx("span", { className: "text-xs uppercase", children: doc.file_type.split("/")[1] || doc.file_type })) : ("-") }), _jsx(TableCell, { children: doc.file_size
                                                        ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
                                                        : "-" }), _jsx(TableCell, { children: format(new Date(doc.created_at), "MMM d, yyyy") }), _jsx(TableCell, { className: "text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", children: [_jsx(MoreVertical, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Actions" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [doc.status === "completed" && (_jsxs(DropdownMenuItem, { onClick: () => handleViewDocument(doc), children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "View Chunks" })] })), doc.storage_path && (_jsxs(DropdownMenuItem, { onClick: () => handleDownload(doc), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Download" })] })), _jsxs(DropdownMenuItem, { onClick: () => {
                                                                            setDocumentToDelete(doc.id);
                                                                            setDeleteDialogOpen(true);
                                                                        }, className: "text-red-600 dark:text-red-400", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Delete" })] })] })] }) })] }, doc.id))) })] }) })) })] }), _jsx(Dialog, { open: showUploader, onOpenChange: setShowUploader, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Upload Document" }), _jsx(DialogDescription, { children: "Upload a document to use for training your AI agent." })] }), _jsx(DocumentUploader, { onUploadComplete: () => {
                                setShowUploader(false);
                                fetchDocuments();
                            } })] }) }), _jsx(Dialog, { open: showChunkViewer, onOpenChange: setShowChunkViewer, children: _jsxs(DialogContent, { className: "sm:max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Document Chunks" }), _jsx(DialogDescription, { children: "View how your document has been processed into chunks for training." })] }), isLoadingChunks ? (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 text-primary animate-spin" }) })) : (selectedDocument && (_jsx(DocumentChunkViewer, { documentId: selectedDocument.id, documentName: selectedDocument.title, chunks: documentChunks })))] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This will permanently delete the document and all associated chunks. This action cannot be undone." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { className: "bg-red-600 hover:bg-red-700", onClick: () => {
                                        if (documentToDelete) {
                                            handleDeleteDocument(documentToDelete);
                                            setDocumentToDelete(null);
                                        }
                                        setDeleteDialogOpen(false);
                                    }, children: "Delete" })] })] }) })] }));
};
export default DocumentsList;
