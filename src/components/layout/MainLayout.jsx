import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function MainLayout() {
  const { library } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onCollapse={setSidebarCollapsed}
      />

      {/* Desktop spacer — matches sidebar width */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 shrink-0 p-1"
            >
              <Menu size={22} />
            </button>

            {library && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 hidden sm:inline">Plan:</span>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {library.planName}
                </span>
                {library.daysRemaining <= 7 && (
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    ⚠️ {library.daysRemaining}d left
                  </span>
                )}
              </div>
            )}
          </div>

          <button className="relative text-gray-500 hover:text-gray-700 shrink-0 p-1">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
