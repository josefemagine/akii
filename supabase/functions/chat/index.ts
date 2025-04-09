import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface ChatRequest {
  message: string;
  conversation_id?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  message: string;
  conversation_id: string;
  timestamp: string;
}

interface User {
  subscription_status: string;
  subscription_id: string;
}

interface Conversation {
  id: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: ChatRequest) => {
      try {
        // Validate required fields
        if (!body.message?.trim()) {
          return createErrorResponse("Message is required", 400);
        }

        // Get or create conversation
        let conversationId = body.conversation_id;
        if (!conversationId) {
          const conversation = await queryOne<Conversation>(
            `INSERT INTO conversations (
              user_id, 
              title, 
              created_at
            ) VALUES ($1, $2, $3) 
            RETURNING id`,
            [
              user.id, 
              body.message.substring(0, 50), 
              new Date().toISOString()
            ]
          );

          if (!conversation) {
            console.error("Error creating conversation");
            return createErrorResponse("Failed to create conversation", 500);
          }

          conversationId = conversation.id;
        }

        // Get user's subscription status
        const userData = await queryOne<User>(
          "SELECT subscription_status, subscription_id FROM users WHERE id = $1",
          [user.id]
        );

        if (!userData) {
          console.error("Error fetching user data");
          return createErrorResponse("Failed to fetch user data", 500);
        }

        // Check if user has active subscription
        if (userData.subscription_status !== "active") {
          return createErrorResponse("Subscription required for chat access", 403);
        }

        // Save message to database
        const timestamp = new Date().toISOString();
        
        // Insert user message
        await execute(
          `INSERT INTO messages (
            conversation_id, 
            user_id, 
            content, 
            role, 
            created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            conversationId, 
            user.id,

            body.message, 
            "user", 
            timestamp
          ]
        );

        // Generate AI response
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          },
          body: JSON.stringify({
            model: body.model || "gpt-4",
            messages: [{ role: "user", content: body.message }],
            temperature: body.temperature || 0.7,
            max_tokens: body.max_tokens || 1000,
          }),
        });

        if (!response.ok) {
          console.error("OpenAI API error:", await response.text());
          return createErrorResponse("Failed to generate response", 500);
        }

        const aiResponse = await response.json();
        const aiMessage = aiResponse.choices[0].message.content;

        // Save AI response to database
        await execute(
          `INSERT INTO messages (
            conversation_id, 
            user_id, 
            content, 
            role, 
            created_at
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            conversationId, 
            user.id, 
            aiMessage, 
            "assistant", 
            new Date().toISOString()
          ]
        );

        return createSuccessResponse({
          message: aiMessage,
          conversation_id: conversationId,
          timestamp: timestamp,
        });
      } catch (error) {
        console.error("Unexpected error in chat:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 