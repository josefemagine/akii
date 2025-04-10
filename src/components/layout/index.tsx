import React from "react";
import DashboardLayout from '../dashboard/DashboardLayout.tsx';
import MainLayout from './MainLayout.tsx';
import { DashboardPageContainer } from './DashboardPageContainer.tsx';
interface IndexProps {}

// Export the dashboard layout components
export { DashboardLayout, MainLayout, DashboardPageContainer };
// Export DashboardLayout as the default export for backwards compatibility
export default DashboardLayout;
export { PageHeader } from './PageHeader.tsx';
export { DashboardSection } from './DashboardSection.tsx';
