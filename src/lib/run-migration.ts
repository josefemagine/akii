import { supabase } from "./supabase";

export async function runMigration(sql: string) {
  try {
    console.log("Running migration...");

    // Get project ID with fallback
    const projectId =
      import.meta.env.SUPABASE_PROJECT_ID || "injxxchotrvgvvzelhvj";
    console.log(`Using Supabase Project ID: ${projectId}`);

    // Call the edge function to run the migration
    const { data, error } = await supabase.functions.invoke("run-migration", {
      body: { sql, projectId },
    });

    if (error) {
      console.error("Error running migration:", error);
      return { success: false, error };
    }

    console.log("Migration completed successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error running migration:", error);
    return { success: false, error };
  }
}
