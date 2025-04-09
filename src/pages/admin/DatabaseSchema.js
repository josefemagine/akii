var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Database, AlertCircle, Search } from "lucide-react";
const DatabaseSchemaPage = () => {
    const [loading, setLoading] = useState(true);
    // Only include tables we know exist
    const [tables, setTables] = useState(["profiles", "auth.users"]);
    const [selectedTable, setSelectedTable] = useState("profiles");
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState(null);
    const [sampleRow, setSampleRow] = useState(null);
    const [customTable, setCustomTable] = useState("");
    const [dbInfo, setDbInfo] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    // Fetch database summary on initial load
    useEffect(() => {
        const fetchDbInfo = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Get information about the database
                const { data: tableInfo, error: tableError } = yield supabaseAdmin
                    .from("profiles")
                    .select("*")
                    .limit(1);
                if (tableError) {
                    console.error("Error fetching database info:", tableError);
                    return;
                }
                // Try to analyze available tables
                let info = "Available tables in the database:\n";
                info += "- profiles (confirmed)\n";
                // Try auth.users
                const { data: authData, error: authError } = yield supabaseAdmin
                    .from("auth.users")
                    .select("*")
                    .limit(1);
                if (!authError) {
                    info += "- auth.users (confirmed)\n";
                }
                else {
                    info += "- auth.users (access denied)\n";
                }
                // Try users table (which doesn't exist)
                try {
                    const { data: usersData, error: usersError } = yield supabaseAdmin
                        .from("users")
                        .select("*")
                        .limit(1);
                    if (!usersError) {
                        info += "- users (confirmed)\n";
                        // Add users to the list if it exists
                        setTables((prev) => [...prev, "users"]);
                    }
                    else {
                        info += `- users (${usersError.message})\n`;
                    }
                }
                catch (err) {
                    info += `- users (table does not exist)\n`;
                }
                setDbInfo(info);
            }
            catch (err) {
                console.error("Error analyzing database:", err);
            }
        });
        fetchDbInfo();
    }, []);
    // Update the directInspectTable function
    const directInspectTable = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            setSampleRow(null);
            // If the table doesn't exist in the database, show a clear error
            if (selectedTable === "users") {
                setError("The 'users' table doesn't exist in the database. User data is likely stored in 'auth.users' or 'profiles'.");
                setColumns([]);
                setLoading(false);
                return;
            }
            // Get a sample row to determine columns
            const { data, error } = yield supabaseAdmin
                .from(selectedTable)
                .select("*")
                .limit(1);
            if (error) {
                console.error("Error inspecting table:", error);
                toast({
                    title: "Error inspecting table",
                    description: error.message,
                    variant: "destructive",
                });
                setError(error.message);
                // For auth tables, try a different approach
                if (selectedTable === "auth.users") {
                    try {
                        const { data: authData, error: authError } = yield supabaseAdmin
                            .from("auth.users")
                            .select("*")
                            .limit(1);
                        if (authError) {
                            console.error("Error fetching auth users:", authError);
                            return;
                        }
                        if (authData && authData.length > 0) {
                            const sampleRow = authData[0];
                            setSampleRow(sampleRow);
                            const extractedColumns = Object.keys(sampleRow).map((column) => ({
                                column_name: column,
                                data_type: typeof sampleRow[column],
                                value: sampleRow[column],
                            }));
                            setColumns(extractedColumns);
                            toast({
                                title: "Auth table inspected",
                                description: `Found ${extractedColumns.length} columns from auth users table`,
                            });
                        }
                    }
                    catch (authErr) {
                        console.error("Error with auth approach:", authErr);
                    }
                }
                return;
            }
            if (data && data.length > 0) {
                // Extract column names from the first row
                const sampleRow = data[0];
                setSampleRow(sampleRow);
                const extractedColumns = Object.keys(sampleRow).map((column) => ({
                    column_name: column,
                    data_type: typeof sampleRow[column],
                    value: sampleRow[column],
                }));
                setColumns(extractedColumns);
                setError(null);
                toast({
                    title: "Table inspected",
                    description: `Found ${extractedColumns.length} columns from sample row`,
                });
            }
            else {
                // No data found - try to get metadata about the table
                try {
                    // Get the table structure if no data is available
                    const { data: structData, error: structError } = yield supabaseAdmin
                        .from(selectedTable)
                        .select()
                        .limit(0)
                        .csv();
                    if (structError) {
                        toast({
                            title: "No data",
                            description: "Table exists but has no data to inspect",
                        });
                        return;
                    }
                    // If we have header info from CSV, parse it
                    if (structData) {
                        const headerLine = structData.split("\n")[0];
                        if (headerLine) {
                            const headers = headerLine.split(",");
                            const extractedColumns = headers.map((header) => ({
                                column_name: header.trim(),
                                data_type: "unknown",
                                value: null,
                            }));
                            setColumns(extractedColumns);
                            setError(null);
                            toast({
                                title: "Table structure inspected",
                                description: `Found ${extractedColumns.length} columns from table structure`,
                            });
                        }
                    }
                }
                catch (err) {
                    toast({
                        title: "No data",
                        description: "Could not find any rows or structure in the table to inspect",
                    });
                }
            }
        }
        catch (err) {
            console.error("Error in direct inspect:", err);
            setError(err instanceof Error ? err.message : String(err));
            toast({
                title: "Error inspecting table",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    });
    // Update the fetchColumns function
    useEffect(() => {
        const fetchColumns = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!selectedTable)
                return;
            try {
                setLoading(true);
                setError(null);
                // Skip the SQL query and go straight to direct inspection for all tables
                yield directInspectTable();
            }
            catch (err) {
                console.error("Error in fetchColumns:", err);
                setError(err instanceof Error ? err.message : String(err));
            }
            finally {
                setLoading(false);
            }
        });
        fetchColumns();
    }, [selectedTable]);
    // Add a function to inspect a custom table
    const inspectCustomTable = () => {
        if (customTable) {
            setSelectedTable(customTable);
        }
        else {
            toast({
                title: "No table specified",
                description: "Please enter a table name to inspect",
                variant: "destructive",
            });
        }
    };
    // Add a function to handle search
    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };
    // Filter columns based on search value
    const filteredColumns = searchValue
        ? columns.filter((col) => col.column_name.toLowerCase().includes(searchValue.toLowerCase()) ||
            String(col.value).toLowerCase().includes(searchValue.toLowerCase()))
        : columns;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Database Schema" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Inspect database tables and columns" })] }) }), dbInfo && (_jsxs(Alert, { className: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800", children: [_jsx(Info, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }), _jsxs(AlertDescription, { className: "text-sm whitespace-pre-line", children: [_jsx("div", { className: "font-semibold mb-1", children: "Database Structure Overview" }), dbInfo] })] })), _jsxs("div", { className: "flex space-x-4", children: [_jsxs(Card, { className: "w-1/3", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tables" }), _jsx(CardDescription, { children: "Select a table to view its schema" })] }), _jsx(CardContent, { children: loading && tables.length === 0 ? (_jsx("div", { className: "py-4 text-center", children: "Loading tables..." })) : error && tables.length === 0 ? (_jsxs("div", { className: "py-4 text-center text-red-500", children: ["Error: ", error] })) : (_jsxs("div", { className: "space-y-2", children: [tables.map((table) => (_jsxs(Button, { variant: selectedTable === table ? "default" : "outline", className: "w-full justify-start", onClick: () => setSelectedTable(table), children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), table] }, table))), _jsxs("div", { className: "mt-6 space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Custom Table" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { placeholder: "Enter table name", value: customTable, onChange: (e) => setCustomTable(e.target.value) }), _jsx(Button, { onClick: inspectCustomTable, disabled: !customTable, children: "Inspect" })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { className: "w-full", onClick: directInspectTable, disabled: !selectedTable, children: "Direct Inspect Selected Table" }) })] })) })] }), _jsxs(Card, { className: "w-2/3", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["Columns for ", selectedTable] }), _jsx(CardDescription, { children: "Column details and data types" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "py-4 text-center", children: "Loading columns..." })) : error ? (_jsxs(Alert, { className: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-600 dark:text-yellow-400" }), _jsxs(AlertDescription, { className: "text-sm", children: [_jsx("div", { className: "font-semibold mb-1", children: "Table Error" }), error] })] })) : columns.length === 0 ? (_jsx("div", { className: "py-4 text-center", children: "No columns found" })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none", children: _jsx(Search, { className: "h-4 w-4 text-gray-400" }) }), _jsx(Input, { type: "text", placeholder: "Search columns or values...", className: "pl-10", value: searchValue, onChange: handleSearch })] }), _jsx("div", { className: "rounded-md border", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "p-2 text-left font-medium", children: "Column Name" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Data Type" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Sample Value" })] }) }), _jsx("tbody", { children: filteredColumns.map((column, i) => (_jsxs("tr", { className: i % 2 ? "bg-muted/50" : "", children: [_jsx("td", { className: "p-2", children: column.column_name }), _jsx("td", { className: "p-2", children: column.data_type }), _jsx("td", { className: "p-2 truncate max-w-[200px]", children: column.value === null ? (_jsx("span", { className: "text-muted-foreground italic", children: "null" })) : typeof column.value === "object" ? (JSON.stringify(column.value)) : (String(column.value)) })] }, i))) })] }) }), sampleRow && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Sample Row (JSON):" }), _jsx("pre", { className: "bg-muted p-4 rounded-md overflow-auto text-xs", children: JSON.stringify(sampleRow, null, 2) })] }))] })) })] })] })] }));
};
export default DatabaseSchemaPage;
