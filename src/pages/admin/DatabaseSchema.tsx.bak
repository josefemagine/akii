import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Database, AlertCircle, Search } from "lucide-react";

const DatabaseSchemaPage = () => {
  const [loading, setLoading] = useState(true);
  // Only include tables we know exist
  const [tables, setTables] = useState<string[]>(["profiles", "auth.users"]);
  const [selectedTable, setSelectedTable] = useState<string>("profiles");
  const [columns, setColumns] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sampleRow, setSampleRow] = useState<any>(null);
  const [customTable, setCustomTable] = useState<string>("");
  const [dbInfo, setDbInfo] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  // Fetch database summary on initial load
  useEffect(() => {
    const fetchDbInfo = async () => {
      try {
        // Get information about the database
        const { data: tableInfo, error: tableError } = await supabaseAdmin
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
        const { data: authData, error: authError } = await supabaseAdmin
          .from("auth.users")
          .select("*")
          .limit(1);

        if (!authError) {
          info += "- auth.users (confirmed)\n";
        } else {
          info += "- auth.users (access denied)\n";
        }

        // Try users table (which doesn't exist)
        try {
          const { data: usersData, error: usersError } = await supabaseAdmin
            .from("users")
            .select("*")
            .limit(1);

          if (!usersError) {
            info += "- users (confirmed)\n";
            // Add users to the list if it exists
            setTables((prev) => [...prev, "users"]);
          } else {
            info += `- users (${usersError.message})\n`;
          }
        } catch (err) {
          info += `- users (table does not exist)\n`;
        }

        setDbInfo(info);
      } catch (err) {
        console.error("Error analyzing database:", err);
      }
    };

    fetchDbInfo();
  }, []);

  // Update the directInspectTable function
  const directInspectTable = async () => {
    try {
      setLoading(true);
      setError(null);
      setSampleRow(null);

      // If the table doesn't exist in the database, show a clear error
      if (selectedTable === "users") {
        setError(
          "The 'users' table doesn't exist in the database. User data is likely stored in 'auth.users' or 'profiles'.",
        );
        setColumns([]);
        setLoading(false);
        return;
      }

      // Get a sample row to determine columns
      const { data, error } = await supabaseAdmin
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
            const { data: authData, error: authError } = await supabaseAdmin
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
          } catch (authErr) {
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
      } else {
        // No data found - try to get metadata about the table
        try {
          // Get the table structure if no data is available
          const { data: structData, error: structError } = await supabaseAdmin
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
        } catch (err) {
          toast({
            title: "No data",
            description:
              "Could not find any rows or structure in the table to inspect",
          });
        }
      }
    } catch (err) {
      console.error("Error in direct inspect:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error inspecting table",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchColumns function
  useEffect(() => {
    const fetchColumns = async () => {
      if (!selectedTable) return;

      try {
        setLoading(true);
        setError(null);

        // Skip the SQL query and go straight to direct inspection for all tables
        await directInspectTable();
      } catch (err) {
        console.error("Error in fetchColumns:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [selectedTable]);

  // Add a function to inspect a custom table
  const inspectCustomTable = () => {
    if (customTable) {
      setSelectedTable(customTable);
    } else {
      toast({
        title: "No table specified",
        description: "Please enter a table name to inspect",
        variant: "destructive",
      });
    }
  };

  // Add a function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Filter columns based on search value
  const filteredColumns = searchValue
    ? columns.filter(
        (col) =>
          col.column_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(col.value).toLowerCase().includes(searchValue.toLowerCase()),
      )
    : columns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Schema</h1>
          <p className="text-muted-foreground mt-1">
            Inspect database tables and columns
          </p>
        </div>
      </div>

      {/* Database info alert */}
      {dbInfo && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm whitespace-pre-line">
            <div className="font-semibold mb-1">
              Database Structure Overview
            </div>
            {dbInfo}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            <CardDescription>Select a table to view its schema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && tables.length === 0 ? (
              <div className="py-4 text-center">Loading tables...</div>
            ) : error && tables.length === 0 ? (
              <div className="py-4 text-center text-red-500">
                Error: {error}
              </div>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <Button
                    key={table}
                    variant={selectedTable === table ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTable(table)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {table}
                  </Button>
                ))}

                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium">Custom Table</p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter table name"
                      value={customTable}
                      onChange={(e) => setCustomTable(e.target.value)}
                    />
                    <Button
                      onClick={inspectCustomTable}
                      disabled={!customTable}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={directInspectTable}
                    disabled={!selectedTable}
                  >
                    Direct Inspect Selected Table
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-2/3">
          <CardHeader>
            <CardTitle>Columns for {selectedTable}</CardTitle>
            <CardDescription>Column details and data types</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-4 text-center">Loading columns...</div>
            ) : error ? (
              <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-sm">
                  <div className="font-semibold mb-1">Table Error</div>
                  {error}
                </AlertDescription>
              </Alert>
            ) : columns.length === 0 ? (
              <div className="py-4 text-center">No columns found</div>
            ) : (
              <div className="space-y-4">
                {/* Add search input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search columns or values..."
                    className="pl-10"
                    value={searchValue}
                    onChange={handleSearch}
                  />
                </div>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">
                          Column Name
                        </th>
                        <th className="p-2 text-left font-medium">Data Type</th>
                        <th className="p-2 text-left font-medium">
                          Sample Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredColumns.map((column, i) => (
                        <tr key={i} className={i % 2 ? "bg-muted/50" : ""}>
                          <td className="p-2">{column.column_name}</td>
                          <td className="p-2">{column.data_type}</td>
                          <td className="p-2 truncate max-w-[200px]">
                            {column.value === null ? (
                              <span className="text-muted-foreground italic">
                                null
                              </span>
                            ) : typeof column.value === "object" ? (
                              JSON.stringify(column.value)
                            ) : (
                              String(column.value)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sampleRow && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Sample Row (JSON):
                    </h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(sampleRow, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSchemaPage;
