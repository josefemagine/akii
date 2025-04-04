// Initialize Bedrock database with mock instances
// Run with: node scripts/init-bedrock-db.js

import { supabase } from '../src/lib/supabase.js';
import { modelToPlan } from '../src/lib/bedrock-db.js';

/**
 * Initial mock instances to populate the database with
 */
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    model_id: "amazon.titan-text-express-v1",
    throughput_name: "pro-throughput",
    status: "InService",
    created_at: new Date().toISOString(),
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    model_id: "anthropic.claude-instant-v1",
    throughput_name: "business-throughput",
    status: "InService",
    created_at: new Date().toISOString(),
    plan: "business"
  }
];

/**
 * Initialize the database
 */
async function initializeDatabase() {
  try {
    console.log('Initializing Bedrock instances database...');
    
    // Check if the bedrock_instances table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('bedrock_instances')
      .select('count')
      .limit(1)
      .single();
    
    if (tableError && tableError.code !== 'PGRST116') {
      console.error('Error checking bedrock_instances table:', tableError);
      console.log('Try running migrations first: npx supabase migrations up');
      return;
    }
    
    // Check if there are already instances
    const { data: existingInstances, error: countError } = await supabase
      .from('bedrock_instances')
      .select('id')
      .limit(1);
    
    if (countError) {
      console.error('Error checking existing instances:', countError);
      return;
    }
    
    if (existingInstances && existingInstances.length > 0) {
      console.log('Database already contains instances. Skipping initialization.');
      console.log('To reset, run: DELETE FROM bedrock_instances;');
      return;
    }
    
    // Insert mock instances
    const { data, error } = await supabase
      .from('bedrock_instances')
      .insert(mockInstances)
      .select();
    
    if (error) {
      console.error('Error inserting mock instances:', error);
      return;
    }
    
    console.log(`Successfully added ${data.length} instances to the database.`);
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Unexpected error during database initialization:', error);
  }
}

// Run the initialization
initializeDatabase().then(() => {
  console.log('Done!');
}); 