import React from "react";
import { Outlet } from "react-router-dom";
import DashboardOverview from "./dashboard/DashboardOverview";

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

const SidebarLink = ({
  icon,
  label,
  active = false,
  href = "#",
  onClick = () => {},
}: SidebarLinkProps) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${active ? "bg-primary text-primary-foreground" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

const Sidebar = ({
  activePage = "dashboard",
  onNavigate = () => {},
}: SidebarProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "agents", label: "AI Agents", icon: "🤖" },
    { id: "training", label: "Training Data", icon: "📚" },
    { id: "integrations", label: "Integrations", icon: "🔌" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold">Akii</h1>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink
            key={item.id}
            icon={<span className="text-xl">{item.icon}</span>}
            label={item.label}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              user@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar = () => {} }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-6">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        ☰
      </button>
      <div className="flex-1 ml-4 lg:ml-0">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="absolute left-3 top-2.5">🔍</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          ⚙️
        </button>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          🌙
        </button>
      </div>
    </header>
  );
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile, shown on larger screens */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const Home = () => {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
};

export default Home;
