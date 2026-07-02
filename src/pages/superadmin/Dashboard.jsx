import { useEffect, useState } from 'react';
import {
  Building2, Users, TrendingUp, AlertCircle,
  CheckCircle, Clock, XCircle, IndianRupee
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLibraries, setRecentLibraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/superadmin/dashboard');
        setStats(res.data.data.stats);
        setRecentLibraries(res.data.data.recentLibraries);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusBadge = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    trial: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all libraries on the platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Libraries" value={stats?.totalLibraries || 0} icon={Building2} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard title="Active Libraries" value={stats?.activeLibraries || 0} icon={CheckCircle} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Expired" value={stats?.expiredLibraries || 0} icon={XCircle} color="text-red-600" bgColor="bg-red-50" />
        <StatCard title="Suspended" value={stats?.suspendedLibraries || 0} icon={AlertCircle} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard title="Total Students" value={stats?.totalStudents?.toLocaleString('en-IN') || 0} icon={Users} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="Pending Renewals" value={stats?.pendingRenewals || 0} icon={Clock} color="text-orange-600" bgColor="bg-orange-50" />
        <StatCard title="Revenue Growth" value="+12%" icon={TrendingUp} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      {/* Recent Libraries Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Libraries</h2>
          <a href="/superadmin/libraries" className="text-sm text-indigo-600 hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Library Name</th>
                <th className="px-6 py-3 text-left">Owner</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLibraries.map((lib) => (
                <tr key={lib._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{lib.name}</td>
                  <td className="px-6 py-4 text-gray-600">{lib.ownerName}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                      {lib.planName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge[lib.status]}`}>
                      {lib.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(lib.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentLibraries.length === 0 && (
            <div className="text-center py-10 text-gray-400">No libraries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
