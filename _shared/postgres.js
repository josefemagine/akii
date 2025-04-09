/**
 * Postgres database utilities for Supabase Edge Functions
 *
 * This module provides helper functions for:
 * - Creating and managing database connections
 * - Executing SQL queries and transactions
 * - Managing database connections through a connection pool
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
// Database connection configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://injxxchotrvgvvzelhvj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_DB_URL = process.env.DATABASE_URL || "";
// Postgres connection pool
let pool = null;
// Initialize the Postgres connection pool
const getPool = () => {
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
export function query(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, params = []) {
        const client = yield getPool().connect();
        try {
            const result = yield client.query(sql, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
// Execute a SQL query with parameters and return a single row
export function queryOne(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, params = []) {
        const rows = yield query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    });
}
// Execute a SQL query for operations that don't return data (INSERT, UPDATE, DELETE)
export function execute(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, params = []) {
        const client = yield getPool().connect();
        try {
            const result = yield client.query(sql, params);
            return result.rowCount || 0;
        }
        finally {
            client.release();
        }
    });
}
// Begin a transaction and execute a callback with the client
export function transaction(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield getPool().connect();
        try {
            yield client.query("BEGIN");
            const result = yield callback(client);
            yield client.query("COMMIT");
            return result;
        }
        catch (error) {
            yield client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    });
}
// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
