/**
 * Postgres database utilities for Supabase Edge Functions
 * 
 * This module provides helper functions for:
 * - Creating and managing database connections
 * - Executing SQL queries and transactions
 * - Managing database connections through a connection pool
 */

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

// Database connection configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://injxxchotrvgvvzelhvj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_DB_URL = process.env.DATABASE_URL || "";

// Postgres connection pool
let pool: Pool | null = null;

// Initialize the Postgres connection pool
const getPool = (): Pool => {
  if (!pool) {
    if (!SUPABASE_DB_URL) {
      throw new Error("DATABASE_URL environment variable not set");
    }
    
    pool = new Pool({
      connectionString: SUPABASE_DB_URL,
      max: 3
    });
  }
  
  return pool;
};

// Execute a SQL query with parameters and return all rows
export async function query<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Execute a SQL query with parameters and return a single row
export async function queryOne<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute a SQL query for operations that don't return data (INSERT, UPDATE, DELETE)
export async function execute(sql: string, params: any[] = []): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

// Begin a transaction and execute a callback with the client
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
); 