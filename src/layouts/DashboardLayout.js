import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
export default function DashboardLayout() {
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [_jsx(TopBar, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-4", children: _jsx(Outlet, {}) })] })] }));
}
