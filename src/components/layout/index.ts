import UnifiedDashboardLayout from './UnifiedDashboardLayout';
import MainLayout from './MainLayout';
import { DashboardPageContainer } from './DashboardPageContainer';

// Export the new unified dashboard layout as the primary export
export { UnifiedDashboardLayout, MainLayout, DashboardPageContainer };

// Also export the unified dashboard as default and as DashboardLayout for backwards compatibility
export { UnifiedDashboardLayout as DashboardLayout };
export default UnifiedDashboardLayout;

export { PageHeader } from './PageHeader';
export { DashboardSection } from './DashboardSection'; 