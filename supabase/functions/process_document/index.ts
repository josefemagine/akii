// This edge function processes uploaded documents, chunks them, and stores them in the database

import serve from "https://deno.land/std@0.208.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";

// Add secret variable references
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { document, format = "text" } = body;
        if (!document) {
          return createErrorResponse("Missing required field: document", 400);
        }

        // Make the OpenAI API call
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { 
                role: "system", 
                content: `You are a document processing assistant. Process the following document and extract key information. Format the output as ${format}.` 
              },
              { role: "user", content: document }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API request failed: ${response.statusText}`);
        }

        const data = await response.json();

        return createSuccessResponse({
          processed_content: data.choices[0].message.content,
          format,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Error in process_document:", error);
        return createErrorResponse((error instanceof Error ? error.message : String(error)));
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
});
