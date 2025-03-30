// This edge function processes uploaded documents, chunks them, and stores them in the database

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Create a Supabase client with the auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    // Get the document ID from the request
    const { documentId } = await req.json();
    if (!documentId) {
      throw new Error("Missing documentId parameter");
    }

    // Get the document from the database
    const { data: document, error: documentError } = await supabaseClient
      .from("training_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      throw new Error(
        `Error fetching document: ${documentError?.message || "Document not found"}`,
      );
    }

    // Update document status to processing
    await supabaseClient
      .from("training_documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from("documents")
      .download(document.file_path);

    if (fileError || !fileData) {
      await supabaseClient
        .from("training_documents")
        .update({
          status: "failed",
          metadata: { error: fileError?.message || "File not found" },
        })
        .eq("id", documentId);
      throw new Error(
        `Error fetching file: ${fileError?.message || "File not found"}`,
      );
    }

    // Process the file based on its type
    let text = "";
    if (document.file_type === "text/plain") {
      text = await fileData.text();
    } else if (document.file_type === "application/pdf") {
      // For PDF, we would need a PDF parser
      // This is a simplified example
      text = "PDF content would be extracted here";
    } else if (document.file_type === "application/json") {
      const json = await fileData.json();
      text = JSON.stringify(json);
    } else {
      // Default to treating as text
      text = await fileData.text();
    }

    // Simple chunking strategy - split by paragraphs and limit size
    const MAX_CHUNK_SIZE = 1000; // characters
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];

    let currentChunk = "";
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Store chunks in the database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const { error: chunkError } = await supabaseClient
        .from("document_chunks")
        .insert({
          document_id: documentId,
          content: chunk,
          metadata: {
            chunk_index: i,
            total_chunks: chunks.length,
          },
        });

      if (chunkError) {
        console.error(`Error storing chunk ${i}:`, chunkError);
      }
    }

    // Update document status to completed
    await supabaseClient
      .from("training_documents")
      .update({
        status: "completed",
        metadata: {
          chunk_count: chunks.length,
          processed_at: new Date().toISOString(),
        },
      })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Document processed successfully. Created ${chunks.length} chunks.`,
        documentId,
        chunkCount: chunks.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
