import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DocumentsList from "@/components/dashboard/documents/DocumentsList";
const Documents = () => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Training Documents" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Upload and manage documents to train your AI agents" })] }), _jsx(DocumentsList, {})] }));
};
export default Documents;
