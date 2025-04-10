/**
 * Debug utilities index
 * This file imports and exports debug utilities for development use
 */

import { checkAdminStatus, fixAdminStatus, getAdminSQLCode } from './admin-helper';
import { enableAdminAccess } from './simple-admin-check';

// Export debug utilities
export {
  checkAdminStatus,
  fixAdminStatus,
  getAdminSQLCode,
  enableAdminAccess
};

// Make available on window in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugUtils = {
    checkAdminStatus,
    fixAdminStatus,
    getAdminSQLCode,
    enableAdminAccess
  };
  
  console.log('🛠️ Debug utilities loaded. Access via window.debugUtils');
  console.log('Available utilities:');
  console.log('- debugUtils.checkAdminStatus() - Check current admin status');
  console.log('- debugUtils.enableAdminAccess() - Quick enable admin mode for correct user ID');
  console.log('- debugUtils.fixAdminStatus() - Full admin fix (profile + localStorage)');
} 