import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import LibrariesPage from './pages/superadmin/Libraries';

// Library Owner Pages
import LibraryDashboard from './pages/library/Dashboard';
import StudentsPage from './pages/library/Students';
import SeatsPage from './pages/library/Seats';
import FeesPage from './pages/library/Fees';
import AttendancePage from './pages/library/Attendance';
import ExpensesPage from './pages/library/Expenses';
import ReportsPage from './pages/library/Reports';
import StaffPage from './pages/library/Staff';
import SettingsPage from './pages/library/Settings';

// Student Portal
import StudentLoginPage from './pages/student/StudentLoginPage';
import StudentPortalPage from './pages/student/StudentPortalPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

// Coming Soon placeholder
const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-400 text-sm mt-2">Coming soon...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ─── Super Admin ─────────────────────────────── */}
          <Route path="/superadmin" element={
            <ProtectedRoute roles={['superadmin']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="libraries" element={<LibrariesPage />} />
            <Route path="subscriptions" element={<ComingSoon title="Subscription Management" />} />
            <Route path="revenue" element={<ComingSoon title="Revenue Analytics" />} />
            <Route path="coupons" element={<ComingSoon title="Coupon Management" />} />
            <Route path="broadcast" element={<ComingSoon title="Broadcast Notifications" />} />
            <Route path="logs" element={<ComingSoon title="Audit Logs" />} />
            <Route path="settings" element={<ComingSoon title="Platform Settings" />} />
          </Route>

          {/* ─── Library Owner / Staff ────────────────────── */}
          <Route path="/" element={
            <ProtectedRoute roles={['owner', 'staff']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LibraryDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="seats" element={<SeatsPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          {/* ─── Student Portal ──────────────────────── */}
          <Route path="/student" element={<StudentLoginPage />} />
          <Route path="/student/portal" element={<StudentPortalPage />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
