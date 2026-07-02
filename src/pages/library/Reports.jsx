import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, IndianRupee, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { paymentAPI, studentAPI } from '../../api/services';
import { Spinner } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sum, pending] = await Promise.all([
          paymentAPI.getSummary(),
          studentAPI.getPendingFees(),
        ]);
        setSummary(sum.data.data);
        setPendingFees(pending.data.data);

        // Mock monthly revenue data
        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
        setMonthlyData(months.map((m, i) => ({
          month: m,
          revenue: Math.floor(Math.random() * 30000) + 10000,
          students: Math.floor(Math.random() * 20) + 30,
          expenses: Math.floor(Math.random() * 10000) + 3000,
        })));
      } catch {
        toast.error('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner />;

  const tabs = [
    { key: 'revenue', label: 'Revenue', icon: IndianRupee },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'pending', label: 'Pending Fees', icon: TrendingUp },
  ];

  const paymentModeData = (summary?.byPaymentMode || []).map((m, i) => ({
    name: m._id, value: m.total, color: COLORS[i],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Insights about your library performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This Month Revenue', value: `₹${(summary?.thisMonth?.total || 0).toLocaleString('en-IN')}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Payments This Month', value: summary?.thisMonth?.count || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Revenue', value: `₹${(summary?.allTime?.total || 0).toLocaleString('en-IN')}`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Fees', value: pendingFees.length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-5`}>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue vs Expenses</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Modes</h2>
            {paymentModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentModeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {paymentModeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Student Growth</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} name="Students" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pending Fees Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Students with Pending Fees ({pendingFees.length})</h2>
          </div>
          {pendingFees.length === 0 ? (
            <div className="text-center py-12 text-gray-400">All fees collected! 🎉</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingFees.map((s, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.mobile} • Seat {s.seatNo || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">₹{s.monthlyFee}/mo</p>
                    <p className="text-xs text-gray-400">Due: {s.feesDueDate} of month</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
