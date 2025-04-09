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
import React from "react";
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BedrockClient } from "@/lib/supabase-bedrock-client";
const AWSTestConnectionModal = ({ isOpen, onClose, }) => {
    var _a, _b, _c, _d, _e, _f;
    const [testing, setTesting] = React.useState(false);
    const [testResults, setTestResults] = React.useState(null);
    const [error, setError] = React.useState(null);
    // Run the tests when the modal opens
    React.useEffect(() => {
        if (isOpen) {
            runTests();
        }
    }, [isOpen]);
    const runTests = () => __awaiter(void 0, void 0, void 0, function* () {
        setTesting(true);
        setError(null);
        setTestResults(null);
        try {
            const response = yield BedrockClient.testAwsPermissions();
            console.log("AWS test response:", response);
            // Handle different response formats
            if (response.success && response.test_results) {
                // Format from our updated Edge Function
                setTestResults(response.test_results);
            }
            else if (response.data && !response.error) {
                // Handle the format seen in the error logs: {data: {...}, error: null}
                console.log("Using data property from response:", response.data);
                // Try to extract test results from the data property
                if (response.data.test_results) {
                    setTestResults(response.data.test_results);
                }
                else if (response.data.credentials) {
                    // If test_results is not there but credentials is, it's probably a flattened structure
                    setTestResults(response.data);
                }
                else {
                    // No recognizable test data structure
                    setError("Response format not recognized. See console for details.");
                }
            }
            else {
                // No success or data property found
                const errorMessage = response.error || "Unknown error occurred during testing";
                console.error("AWS test error:", errorMessage, response);
                setError(errorMessage);
            }
        }
        catch (err) {
            console.error("Error running AWS tests:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        }
        finally {
            setTesting(false);
        }
    });
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "sm:max-w-[600px] max-h-[80vh] flex flex-col dark:bg-slate-900 dark:border-slate-800", children: [_jsxs(DialogHeader, { className: "dark:text-slate-100", children: [_jsx(DialogTitle, { children: "AWS Connection Test Results" }), _jsx(DialogDescription, { className: "dark:text-slate-300", children: "Detailed results from testing your AWS Bedrock connection" })] }), _jsx(ScrollArea, { className: "flex-1 px-1", children: testing ? (_jsxs("div", { className: "py-8 flex flex-col items-center justify-center text-center", children: [_jsx(Loader2, { className: "h-8 w-8 mb-4 animate-spin text-primary" }), _jsx("p", { className: "text-sm text-muted-foreground dark:text-slate-400", children: "Testing AWS Bedrock connection..." })] })) : error ? (_jsxs("div", { className: "py-6 flex flex-col items-center justify-center text-center", children: [_jsx(AlertCircle, { className: "h-8 w-8 mb-4 text-destructive" }), _jsx("h3", { className: "font-semibold text-lg mb-2 dark:text-slate-100", children: "Test Failed" }), _jsx("p", { className: "text-sm text-muted-foreground dark:text-slate-300 max-w-md", children: error }), _jsx(Button, { variant: "outline", onClick: runTests, className: "mt-4 dark:text-slate-200 dark:border-slate-700", children: "Retry Test" })] })) : testResults ? (_jsxs("div", { className: "space-y-6 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("h3", { className: "font-semibold text-lg flex items-center dark:text-slate-100", children: [testResults.credentials.success ? (_jsx(CheckCircle2, { className: "h-5 w-5 mr-2 text-green-500 dark:text-green-400" })) : (_jsx(XCircle, { className: "h-5 w-5 mr-2 text-destructive" })), "Credentials"] }), _jsxs("div", { className: "rounded-md border p-4 space-y-2 dark:bg-slate-800 dark:border-slate-700", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium dark:text-slate-200", children: "Status" }), _jsx("span", { className: cn("text-sm", testResults.credentials.success
                                                            ? "text-green-500 dark:text-green-400"
                                                            : "text-destructive"), children: testResults.credentials.message })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium dark:text-slate-200", children: "Region" }), _jsx("span", { className: "text-sm dark:text-slate-300", children: testResults.credentials.region })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium dark:text-slate-200", children: "Access Key" }), _jsx("span", { className: "text-sm dark:text-slate-300", children: testResults.credentials.hasAccessKey ? "✓ Present" : "✗ Missing" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium dark:text-slate-200", children: "Secret Key" }), _jsx("span", { className: "text-sm dark:text-slate-300", children: testResults.credentials.hasSecretAccessKey ? "✓ Present" : "✗ Missing" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-semibold text-lg dark:text-slate-100", children: "API Permissions" }), _jsx("div", { className: "rounded-md border p-4 space-y-2 dark:bg-slate-800 dark:border-slate-700", children: testResults.permissions && Object.entries(testResults.permissions).map(([key, test]) => (_jsxs("div", { className: "flex justify-between items-center py-1", children: [_jsx("span", { className: "text-sm font-medium capitalize dark:text-slate-200", children: key.replace(/([A-Z])/g, ' $1').trim() }), _jsx("div", { className: "flex items-center", children: test.success ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "h-4 w-4 mr-2 text-green-500 dark:text-green-400" }), _jsx("span", { className: "text-sm text-green-500 dark:text-green-400", children: "Passed" })] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-4 w-4 mr-2 text-destructive" }), _jsx("span", { className: "text-sm text-destructive", children: "Failed" })] })) })] }, key))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-semibold text-lg dark:text-slate-100", children: "Diagnostic Information" }), _jsxs("div", { className: "rounded-md border p-4 space-y-2 text-xs font-mono bg-muted/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Runtime" }), _jsx("span", { children: ((_b = (_a = testResults.diagnostics) === null || _a === void 0 ? void 0 : _a.environment) === null || _b === void 0 ? void 0 : _b.runtime) || "unknown" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Region" }), _jsx("span", { children: ((_d = (_c = testResults.diagnostics) === null || _c === void 0 ? void 0 : _c.environment) === null || _d === void 0 ? void 0 : _d.region) || "unknown" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Function" }), _jsx("span", { children: ((_f = (_e = testResults.diagnostics) === null || _e === void 0 ? void 0 : _e.environment) === null || _f === void 0 ? void 0 : _f.function_name) || "unknown" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Timestamp" }), _jsx("span", { children: new Date(testResults.timestamp).toLocaleString() })] })] })] })] })) : (_jsxs("div", { className: "py-8 flex flex-col items-center justify-center text-center", children: [_jsx(AlertCircle, { className: "h-8 w-8 mb-4 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground dark:text-slate-400", children: "No test results available" })] })) }), _jsxs(DialogFooter, { className: "pt-4", children: [_jsx(Button, { variant: "outline", onClick: runTests, disabled: testing, className: "mr-2 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600 font-medium", children: testing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Testing..."] })) : ("Run Tests Again") }), _jsx(Button, { onClick: onClose, className: "dark:bg-green-600 dark:hover:bg-green-700", children: "Close" })] })] }) }));
};
export default AWSTestConnectionModal;
