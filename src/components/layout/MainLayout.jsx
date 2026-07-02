import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function MainLayout() {
  const { library } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            {library && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Plan:</span>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {library.planName}
                </span>
                {library.daysRemaining <= 7 && (
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    ⚠️ Expires in {library.daysRemaining} days
                  </span>
                )}
              </div>
            )}
          </div>
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
