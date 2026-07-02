import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Building2, Users, Armchair,
  IndianRupee, BarChart2, Settings, LogOut, Menu, X,
  Bell, ChevronDown, CalendarCheck, CreditCard, Receipt,
  UserCog, Megaphone, Tag, FileText
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const superAdminNav = [
  { label: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
  { label: 'Libraries', path: '/superadmin/libraries', icon: Building2 },
  { label: 'Subscriptions', path: '/superadmin/subscriptions', icon: CreditCard },
  { label: 'Revenue', path: '/superadmin/revenue', icon: IndianRupee },
  { label: 'Coupons', path: '/superadmin/coupons', icon: Tag },
  { label: 'Broadcast', path: '/superadmin/broadcast', icon: Megaphone },
  { label: 'Audit Logs', path: '/superadmin/logs', icon: FileText },
  { label: 'Settings', path: '/superadmin/settings', icon: Settings },
];

const ownerNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Seats', path: '/seats', icon: Armchair },
  { label: 'Fees', path: '/fees', icon: Receipt },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Expenses', path: '/expenses', icon: IndianRupee },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
  { label: 'Staff', path: '/staff', icon: UserCog },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, library, logout, isSuperAdmin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = isSuperAdmin() ? superAdminNav : ownerNav;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <aside className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <span className="font-bold text-sm">{library?.name || 'LibrarySaaS'}</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm transition
                ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-800 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-gray-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
