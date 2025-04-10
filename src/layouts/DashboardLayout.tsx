import React from "react";

import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar.tsx';
import { TopBar } from '@/components/TopBar.tsx';

interface DashboardLayoutProps {}

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
