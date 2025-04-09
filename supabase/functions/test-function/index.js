var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
import createClient from 'npm:@supabase/supabase-js@2';
import serve from 'https://deno.land/std@0.208.0/http/server.ts';
// Initialize Supabase client
const supabaseClient = createClient((_a = Deno.env.get('SUPABASE_URL')) !== null && _a !== void 0 ? _a : '', (_b = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _b !== void 0 ? _b : '');
serve((req) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error(`Error processing request: ${error}`);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}));
