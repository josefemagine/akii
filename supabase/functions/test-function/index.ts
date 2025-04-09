import createClient from 'npm:@supabase/supabase-js@2';
import serve from 'https://deno.land/std@0.208.0/http/server.ts';

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  try {
    console.log("Processing request");
    
    const data = {
      message: "Test function response",
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
}); 