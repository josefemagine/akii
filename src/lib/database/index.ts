/**
 * Database Service
 * 
 * Centralized service for all database interactions using Supabase REST API.
 * This eliminates direct Postgres connections and standardizes database access.
 */

import { supabase } from '@/lib/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { User } from '@supabase/supabase-js';

/**
 * Database Service provides a standardized interface for all database operations
 * through the Supabase REST API.
 */
export class DatabaseService {
  /**
   * Get an item from a table by its ID
   */
  static async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching ${table} with id ${id}:`, error);
      return null;
    }
    
    return data as T;
  }
  
  /**
   * Get items from a table with optional filters
   */
  static async getItems<T>(
    table: string, 
    options: {
      select?: string, 
      filters?: Record<string, any>,
      limit?: number,
      order?: { column: string, ascending?: boolean }
    } = {}
  ): Promise<T[]> {
    const { select = '*', filters = {}, limit, order } = options;
    
    let query = supabase
      .from(table)
      .select(select);
    
    // Apply filters
    query = this.applyFilters(query, filters);
    
    // Apply order
    if (order) {
      query = query.order(
        order.column, 
        { ascending: order.ascending ?? true }
      );
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
    
    return data as T[];
  }
  
  /**
   * Insert an item into a table
   */
  static async insertItem<T>(table: string, item: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }
    
    return data as T;
  }
  
  /**
   * Update an item in a table
   */
  static async updateItem<T>(
    table: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table} with id ${id}:`, error);
      return null;
    }
    
    return data as T;
  }
  
  /**
   * Delete an item from a table
   */
  static async deleteItem(table: string, id: string): Promise<boolean> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table} with id ${id}:`, error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Call an RPC function
   */
  static async callFunction<T = any>(
    functionName: string, 
    params: Record<string, any> = {}
  ): Promise<T | null> {
    try {
      // Don't use generic type parameter with rpc
      const { data, error } = await supabase.rpc(functionName, params);
      
      if (error) {
        console.error(`Error calling function ${functionName}:`, error);
        return null;
      }
      
      return data as T;
    } catch (err) {
      console.error(`Exception calling function ${functionName}:`, err);
      return null;
    }
  }
  
  /**
   * Helper to apply filters to a query
   */
  private static applyFilters(
    query: any,
    filters: Record<string, any>
  ): any {
    let filteredQuery = query;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (typeof value === 'object' && value.operator) {
        // Handle special operators like gt, lt, etc.
        switch (value.operator) {
          case 'gt':
            filteredQuery = filteredQuery.gt(key, value.value);
            break;
          case 'gte':
            filteredQuery = filteredQuery.gte(key, value.value);
            break;
          case 'lt':
            filteredQuery = filteredQuery.lt(key, value.value);
            break;
          case 'lte':
            filteredQuery = filteredQuery.lte(key, value.value);
            break;
          case 'like':
            filteredQuery = filteredQuery.like(key, value.value);
            break;
          case 'ilike':
            filteredQuery = filteredQuery.ilike(key, value.value);
            break;
          case 'in':
            filteredQuery = filteredQuery.in(key, value.value);
            break;
          case 'contains':
            filteredQuery = filteredQuery.contains(key, value.value);
            break;
          case 'containedBy':
            filteredQuery = filteredQuery.containedBy(key, value.value);
            break;
          case 'rangeLt':
            filteredQuery = filteredQuery.rangeLt(key, value.value);
            break;
          case 'rangeGt':
            filteredQuery = filteredQuery.rangeGt(key, value.value);
            break;
          case 'rangeGte':
            filteredQuery = filteredQuery.rangeGte(key, value.value);
            break;
          case 'rangeLte':
            filteredQuery = filteredQuery.rangeLte(key, value.value);
            break;
          case 'overlaps':
            filteredQuery = filteredQuery.overlaps(key, value.value);
            break;
          case 'textSearch':
            filteredQuery = filteredQuery.textSearch(key, value.value, {
              config: value.config,
              type: value.type,
            });
            break;
          case 'not':
            filteredQuery = filteredQuery.not(key, value.value, { foreignTable: value.foreignTable });
            break;
          case 'filter':
            filteredQuery = filteredQuery.filter(key, value.operator, value.value);
            break;
          default:
            filteredQuery = filteredQuery.eq(key, value.value);
        }
      } else {
        // Default to equals
        filteredQuery = filteredQuery.eq(key, value);
      }
    });
    
    return filteredQuery;
  }
  
  /**
   * Get user profile by ID
   */
  static async getUserProfile<T>(userId: string): Promise<T | null> {
    return this.getById<T>('profiles', userId);
  }
  
  /**
   * Check database connection
   */
  static async checkConnection() {
    return this.callFunction('check_database_connection');
  }
  
  /**
   * Check if user is admin
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const profile = await this.getById<{ is_admin?: boolean }>('profiles', userId);
      return profile?.is_admin === true;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }
  
  /**
   * Toggle user admin status (requires admin privileges)
   */
  static async toggleAdminStatus(userId: string): Promise<boolean> {
    try {
      const result = await this.callFunction<boolean>('toggle_admin_status', {
        target_user_id: userId
      });
      return result === true;
    } catch (err) {
      console.error('Error toggling admin status:', err);
      return false;
    }
  }
  
  /**
   * Get user details from auth.users (requires admin privileges)
   */
  static async getUserDetails(userId: string) {
    return this.callFunction('get_user_details', { user_id: userId });
  }
} 