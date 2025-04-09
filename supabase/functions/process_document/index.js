// This edge function processes uploaded documents, chunks them, and stores them in the database
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
// Add secret variable references
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { document, format = "text" } = body;
            if (!document) {
                return createErrorResponse("Missing required field: document", 400);
            }
            // Make the OpenAI API call
            const response = yield fetch("https://api.openai.com/v1/chat/completions", {
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
            const data = yield response.json();
            return createSuccessResponse({
                processed_content: data.choices[0].message.content,
                format,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error("Error in process_document:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
