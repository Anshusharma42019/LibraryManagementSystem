import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Building2, Users, Armchair,
  IndianRupee, BarChart2, Settings, LogOut, Menu, X,
  CalendarCheck, CreditCard, Receipt, UserCog, Megaphone,
  Tag, FileText,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const superAdminNav = [
  { label: 'Dashboard',     path: '/superadmin/dashboard',     icon: LayoutDashboard },
  { label: 'Libraries',     path: '/superadmin/libraries',     icon: Building2 },
  { label: 'Subscriptions', path: '/superadmin/subscriptions', icon: CreditCard },
  { label: 'Revenue',       path: '/superadmin/revenue',       icon: IndianRupee },
  { label: 'Coupons',       path: '/superadmin/coupons',       icon: Tag },
  { label: 'Broadcast',     path: '/superadmin/broadcast',     icon: Megaphone },
  { label: 'Audit Logs',    path: '/superadmin/logs',          icon: FileText },
  { label: 'Settings',      path: '/superadmin/settings',      icon: Settings },
];

const ownerNav = [
  { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Students',   path: '/students',   icon: Users },
  { label: 'Seats',      path: '/seats',      icon: Armchair },
  { label: 'Fees',       path: '/fees',       icon: Receipt },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Expenses',   path: '/expenses',   icon: IndianRupee },
  { label: 'Reports',    path: '/reports',    icon: BarChart2 },
  { label: 'Staff',      path: '/staff',      icon: UserCog },
  { label: 'Settings',   path: '/settings',   icon: Settings },
];

export default function Sidebar({ mobileOpen, onMobileClose, onCollapse }) {
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

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (onCollapse) onCollapse(next);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          bg-gray-900 text-white flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          min-h-screen shrink-0
          fixed lg:sticky top-0 inset-y-0 left-0 z-50 h-screen
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen size={15} />
              </div>
              <span className="font-bold text-sm truncate">{library?.name || 'LibrarySaaS'}</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="text-gray-400 hover:text-white transition shrink-0 ml-auto"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                title={collapsed ? label : ''}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm transition mb-0.5
                  ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-gray-800 p-3 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition shrink-0">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-gray-400 hover:text-red-400 py-1">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
