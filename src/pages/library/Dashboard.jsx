import { useEffect, useState } from 'react';
import {
  Users, Armchair, IndianRupee, AlertCircle, Clock,
  CheckCircle, TrendingUp, TrendingDown, CalendarCheck, Zap,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { dashboardAPI, studentAPI } from '../../api/services';
import { StatCard, Spinner, Badge } from '../../components/ui/index.jsx';
import useAuthStore from '../../store/authStore';

export default function LibraryDashboard() {
  const { library } = useAuthStore();
  const [stats, setStats]                   = useState(null);
  const [chartData, setChartData]           = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [expiringStudents, setExpiringStudents] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, expiringRes] = await Promise.all([
          dashboardAPI.getStats(),
          studentAPI.getExpiring(7),
        ]);

        const d = dashRes.data.data;
        setStats(d.stats);
        setChartData(d.monthlyChart || []);
        setRecentPayments(d.recentPayments || []);
        setExpiringStudents(expiringRes.data.data || []);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load dashboard data.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const daysLeft = library?.subscriptionExpiry
    ? Math.max(0, Math.ceil((new Date(library.subscriptionExpiry) - new Date()) / 86400000))
    : 0;

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{library?.name || 'Dashboard'}</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        {daysLeft > 0 && daysLeft <= 15 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-600 font-medium">Subscription expires in {daysLeft} days</span>
          </div>
        )}
      </div>

      {/* Stats Row 1 — Students & Seats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={s.totalStudents ?? 0}
          icon={Users}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          subtitle="All time"
        />
        <StatCard
          title="Active Students"
          value={s.activeStudents ?? 0}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle={`${s.expiringStudents ?? 0} expiring this week`}
        />
        <StatCard
          title="Total Seats"
          value={s.totalSeats ?? 0}
          icon={Armchair}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle={`${s.availableSeats ?? 0} available`}
        />
        <StatCard
          title="Today's Attendance"
          value={s.todayAttendance ?? 0}
          icon={CalendarCheck}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle="Present today"
        />
      </div>

      {/* Stats Row 2 — Finance */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="This Month Revenue"
          value={`₹${(s.monthlyRevenue ?? 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          subtitle={`${s.paymentsThisMonth ?? 0} payments`}
        />
        <StatCard
          title="This Month Expense"
          value={`₹${(s.monthlyExpense ?? 0).toLocaleString('en-IN')}`}
          icon={TrendingDown}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Net Profit"
          value={`₹${(s.netProfit ?? 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color={(s.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}
          bgColor={(s.netProfit ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}
          subtitle="Revenue - Expenses"
        />
        <StatCard
          title="Occupied Seats"
          value={s.occupiedSeats ?? 0}
          icon={Zap}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
          subtitle={`of ${s.totalSeats ?? 0} total`}
        />
      </div>

      {/* Chart + Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue vs Expenses (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`]} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900">Subscription</h2>
          <div className="space-y-3">
            {[
              ['Plan',          <Badge text={library?.planName || 'Starter'} type="default" />],
              ['Status',        <Badge text={library?.status || 'active'} type={library?.status === 'active' ? 'active' : 'expired'} />],
              ['Seats Allowed', <span className="font-medium">{library?.totalSeatsAllowed ?? 0}</span>],
              ['Expiry',        <span className="font-medium text-sm">{library?.subscriptionExpiry ? new Date(library.subscriptionExpiry).toLocaleDateString('en-IN') : '—'}</span>],
              ['Days Left',     <span className={`font-bold ${daysLeft <= 15 ? 'text-red-600' : 'text-green-600'}`}>{daysLeft} days</span>],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{label}</span>
                {val}
              </div>
            ))}
          </div>

          {/* Seat usage bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Seat Usage</span>
              <span>{s.occupiedSeats ?? 0} / {library?.totalSeatsAllowed ?? 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((s.occupiedSeats ?? 0) / (library?.totalSeatsAllowed || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Students */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock size={16} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">Expiring This Week ({expiringStudents.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {expiringStudents.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No students expiring soon 🎉</p>
            ) : expiringStudents.slice(0, 6).map(s => (
              <div key={s._id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">Seat {s.seatNo || '—'} • {s.mobile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-500 font-medium">
                    {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-IN') : '—'}
                  </p>
                  <p className="text-xs text-gray-400">₹{s.monthlyFee}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <IndianRupee size={16} className="text-green-500" />
            <h2 className="font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No payments yet</p>
            ) : recentPayments.map(p => (
              <div key={p._id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                    {(p.studentName || p.studentId?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.studentName || p.studentId?.name || '—'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {p.paymentMode} • {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +₹{(p.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
