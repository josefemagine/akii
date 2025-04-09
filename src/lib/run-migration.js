var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from "./supabase";
export function runMigration(sql) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Running migration...");
            // Get project ID with fallback
            const projectId = import.meta.env.SUPABASE_PROJECT_ID || "injxxchotrvgvvzelhvj";
            console.log(`Using Supabase Project ID: ${projectId}`);
            // Call the edge function to run the migration
            const { data, error } = yield supabase.functions.invoke("run-migration", {
                body: { sql, projectId },
            });
            if (error) {
                console.error("Error running migration:", error);
                return { success: false, error };
            }
            console.log("Migration completed successfully");
            return { success: true, data };
        }
        catch (error) {
            console.error("Unexpected error running migration:", error);
            return { success: false, error };
        }
    });
}
