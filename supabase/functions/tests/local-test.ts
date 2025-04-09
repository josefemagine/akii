import assertEquals from "https://deno.land/std@0.208.0/assert/assert_equals.ts";
import serve from "https://deno.land/std@0.208.0/http/server.ts";

// Add type declaration for ImportMeta
declare global {
  interface ImportMeta {
    main: boolean;
  }
}

// Mock request helper
const createMockRequest = (body: any = null, method = "POST") => {
  return new Request("http://localhost:54321", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });
};

// Test logging functionality
export async function testEdgeFunctionLogging() {
  const mockConsole = {
    logs: [] as string[],
    warns: [] as string[],
    errors: [] as string[],
    log: function(msg: string) { this.logs.push(msg); },
    warn: function(msg: string) { this.warns.push(msg); },
    error: function(msg: string) { this.errors.push(msg); }
  };

  // Replace console methods temporarily
  const originalConsole = { 
    log: console.log, 
    warn: console.warn, 
    error: console.error 
  };
  console.log = mockConsole.log.bind(mockConsole);
  console.warn = mockConsole.warn.bind(mockConsole);
  console.error = mockConsole.error.bind(mockConsole);

  try {
    // Test handler with logging
    const handler = (req: Request) => {
      try {
        console.log("Processing request");
        console.warn("Test warning message");
        
        const data = {
          message: "Test response",
          timestamp: new Date().toISOString()
        };
        
        console.log(`Returning data: ${JSON.stringify(data)}`);
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error(`Error processing request: ${error}`);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    };

    // Test the handler
    const response = await handler(createMockRequest());
    const responseData = await response.json();

    // Verify logs were captured
    assertEquals(mockConsole.logs.length >= 2, true, "Should have at least 2 log messages");
    assertEquals(mockConsole.warns.length, 1, "Should have 1 warning message");
    assertEquals(mockConsole.errors.length, 0, "Should have no error messages");
    assertEquals(responseData.message, "Test response", "Response should contain test message");

  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
}

// Test error handling and logging
export async function testEdgeFunctionErrorLogging() {
  const mockConsole = {
    logs: [] as string[],
    warns: [] as string[],
    errors: [] as string[],
    log: function(msg: string) { this.logs.push(msg); },
    warn: function(msg: string) { this.warns.push(msg); },
    error: function(msg: string) { this.errors.push(msg); }
  };

  // Replace console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };
  console.log = mockConsole.log.bind(mockConsole);
  console.warn = mockConsole.warn.bind(mockConsole);
  console.error = mockConsole.error.bind(mockConsole);

  try {
    // Test handler that throws an error
    const handler = (req: Request) => {
      try {
        console.log("Starting error test");
        throw new Error("Test error");
      } catch (error) {
        console.error(`Caught error: ${error}`);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    };

    // Test the handler
    const response = await handler(createMockRequest());
    const responseData = await response.json();

    // Verify error logs were captured
    assertEquals(mockConsole.logs.length, 1, "Should have 1 log message");
    assertEquals(mockConsole.errors.length, 1, "Should have 1 error message");
    assertEquals(response.status, 500, "Should return 500 status");
    assertEquals(responseData.error, "Internal Server Error", "Should return error message");

  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
}

// Run tests
if (import.meta.main) {
  console.log("Running edge function tests...");
  await testEdgeFunctionLogging();
  await testEdgeFunctionErrorLogging();
  console.log("All tests completed successfully!");
} 