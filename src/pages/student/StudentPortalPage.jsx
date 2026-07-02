import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, LogOut, BookOpen, Clock, CalendarCheck, IndianRupee,
  Armchair, User, ChevronLeft, ChevronRight, CheckCircle,
  XCircle, AlertCircle, LogOut as SignOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { studentPortalAPI } from '../../api/services';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const STATUS_STYLE = {
  present:  'bg-green-100 text-green-700',
  absent:   'bg-red-100 text-red-700',
  half_day: 'bg-yellow-100 text-yellow-700',
  booked:   'bg-blue-100 text-blue-700',
  holiday:  'bg-gray-100 text-gray-500',
};

const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

export default function StudentPortalPage() {
  const navigate = useNavigate();
  const token   = sessionStorage.getItem('studentToken');
  const cached  = sessionStorage.getItem('studentData');

  const [student, setStudent]       = useState(cached ? JSON.parse(cached) : null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab]               = useState('home');
  const [attMonth, setAttMonth]     = useState(new Date().getMonth() + 1);
  const [attYear, setAttYear]       = useState(new Date().getFullYear());
  const [attSummary, setAttSummary] = useState(null);
  const [liveTime, setLiveTime]     = useState(new Date());

  // redirect if no token
  useEffect(() => {
    if (!token) navigate('/student', { replace: true });
  }, [token, navigate]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch student data
  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await studentPortalAPI.getMe(token);
      setStudent(res.data.data.student);
      setTodayStatus(res.data.data.todayStatus);
      sessionStorage.setItem('studentData', JSON.stringify(res.data.data.student));
    } catch {
      toast.error('Session expired. Please login again.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // Fetch attendance
  const fetchAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await studentPortalAPI.getAttendance(token, { month: attMonth, year: attYear });
      setAttendance(res.data.data.records);
      setAttSummary(res.data.data.summary);
    } catch { toast.error('Failed to load attendance.'); }
  }, [token, attMonth, attYear]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await studentPortalAPI.getPayments(token);
      setPayments(res.data.data);
    } catch { toast.error('Failed to load payments.'); }
  }, [token]);

  useEffect(() => { if (tab === 'attendance') fetchAttendance(); }, [tab, fetchAttendance]);
  useEffect(() => { if (tab === 'payments') fetchPayments(); }, [tab, fetchPayments]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await studentPortalAPI.checkIn(token);
      toast.success(res.data.message);
      fetchMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await studentPortalAPI.checkOut(token);
      toast.success(res.data.message);
      fetchMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally { setActionLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studentToken');
    sessionStorage.removeItem('studentData');
    navigate('/student', { replace: true });
  };

  // Days until expiry
  const daysLeft = student?.expiryDate
    ? Math.max(0, Math.ceil((new Date(student.expiryDate) - new Date()) / 86400000))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Top Bar */}
      <header className="bg-indigo-600 text-white px-5 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
            {student?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{student?.name}</p>
            <p className="text-indigo-200 text-xs">{student?.studentCode} • Seat {student?.seatNo || '—'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition" title="Logout">
          <SignOut size={18} />
        </button>
      </header>

      {/* Live Clock */}
      <div className="bg-indigo-700 text-white text-center py-2">
        <p className="text-2xl font-bold tracking-widest font-mono">
          {liveTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </p>
        <p className="text-indigo-300 text-xs">
          {liveTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* ── HOME TAB ─────────────────────────────────── */}
        {tab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Check In / Out Card */}
            <div className={`rounded-3xl p-6 text-white shadow-lg ${todayStatus?.isCheckedIn ? 'bg-green-500' : 'bg-indigo-600'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">Today's Status</p>
                  <p className="text-xl font-bold mt-0.5">
                    {todayStatus?.isCheckedIn ? '🟢 Currently Inside' : todayStatus?.checkOut ? '✅ Session Complete' : '⬜ Not Checked In'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${todayStatus?.isCheckedIn ? 'bg-white/20' : 'bg-white/20'}`}>
                  {todayStatus?.isCheckedIn ? <LogIn size={22} /> : <LogOut size={22} />}
                </div>
              </div>

              {/* Time info */}
              {(todayStatus?.checkIn || todayStatus?.checkOut) && (
                <div className="flex gap-4 mb-4 text-sm">
                  {todayStatus.checkIn && (
                    <div className="bg-white/20 rounded-xl px-3 py-2">
                      <p className="text-white/70 text-xs">Check In</p>
                      <p className="font-semibold">{formatTime(todayStatus.checkIn)}</p>
                    </div>
                  )}
                  {todayStatus.checkOut && (
                    <div className="bg-white/20 rounded-xl px-3 py-2">
                      <p className="text-white/70 text-xs">Check Out</p>
                      <p className="font-semibold">{formatTime(todayStatus.checkOut)}</p>
                    </div>
                  )}
                  {todayStatus.totalHours > 0 && (
                    <div className="bg-white/20 rounded-xl px-3 py-2">
                      <p className="text-white/70 text-xs">Hours</p>
                      <p className="font-semibold">{todayStatus.totalHours} hrs</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!todayStatus?.checkOut && (
                <button
                  onClick={todayStatus?.isCheckedIn ? handleCheckOut : handleCheckIn}
                  disabled={actionLoading}
                  className="w-full bg-white text-indigo-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition hover:bg-indigo-50 disabled:opacity-60 shadow-md"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : todayStatus?.isCheckedIn ? (
                    <><LogOut size={18} /> Check Out</>
                  ) : (
                    <><LogIn size={18} /> Check In</>
                  )}
                </button>
              )}
              {todayStatus?.checkOut && (
                <div className="text-center text-white/80 text-sm py-2">
                  Session complete for today ✓
                </div>
              )}
            </div>

            {/* Student Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Armchair size={15} className="text-indigo-500" />
                  <p className="text-xs text-gray-400 font-medium">My Seat</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{student?.seatNo || '—'}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{student?.shift} shift</p>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm border ${daysLeft <= 7 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck size={15} className={daysLeft <= 7 ? 'text-red-500' : 'text-green-500'} />
                  <p className="text-xs text-gray-400 font-medium">Expiry</p>
                </div>
                <p className={`text-xl font-bold ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>{daysLeft} days</p>
                <p className="text-xs text-gray-400 mt-0.5">{student?.expiryDate ? new Date(student.expiryDate).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={15} className="text-orange-500" />
                  <p className="text-xs text-gray-400 font-medium">Shift Time</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {student?.shiftTime?.start} – {student?.shiftTime?.end}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee size={15} className="text-emerald-500" />
                  <p className="text-xs text-gray-400 font-medium">Monthly Fee</p>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{student?.monthlyFee}</p>
              </div>
            </div>

            {/* Expiry Warning */}
            {daysLeft <= 7 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Membership Expiring Soon!</p>
                  <p className="text-xs text-red-500 mt-0.5">Only {daysLeft} day{daysLeft !== 1 ? 's' : ''} left. Contact library staff to renew.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE TAB ───────────────────────────── */}
        {tab === 'attendance' && (
          <div className="p-4 space-y-4">
            {/* Month selector */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
              <button onClick={() => { if (attMonth === 1) { setAttMonth(12); setAttYear(y => y - 1); } else setAttMonth(m => m - 1); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronLeft size={18} /></button>
              <span className="font-semibold text-gray-800 text-sm">{MONTHS[attMonth - 1]} {attYear}</span>
              <button onClick={() => { if (attMonth === 12) { setAttMonth(1); setAttYear(y => y + 1); } else setAttMonth(m => m + 1); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronRight size={18} /></button>
            </div>

            {/* Summary */}
            {attSummary && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Present', value: attSummary.present, cls: 'bg-green-50 text-green-700' },
                  { label: 'Half Day', value: attSummary.halfDay, cls: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Absent', value: attSummary.absent, cls: 'bg-red-50 text-red-700' },
                  { label: 'Hrs', value: attSummary.totalHours, cls: 'bg-indigo-50 text-indigo-700' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-3 text-center ${s.cls}`}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Records List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {attendance.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-sm">No attendance records this month.</p>
              ) : attendance.map(r => (
                <div key={r._id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600">
                      {new Date(r.date).getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {r.checkIn && (
                        <p className="text-xs text-gray-400">
                          {formatTime(r.checkIn)} → {r.checkOut ? formatTime(r.checkOut) : 'Still inside'}
                          {r.totalHours > 0 && ` • ${r.totalHours} hrs`}
                        </p>
                      )}
                      {r.bookedSlotHours && (
                        <p className="text-xs text-blue-500">{r.slotStartTime}–{r.slotEndTime} ({r.bookedSlotHours} hrs slot)</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-500'}`}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ─────────────────────────────── */}
        {tab === 'payments' && (
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-500 font-medium">Last 12 payments</p>
            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                <IndianRupee size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No payment records found.</p>
              </div>
            ) : payments.map(p => (
              <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.paymentMonth || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.paymentMode} • {new Date(p.paidAt).toLocaleDateString('en-IN')}</p>
                  {p.receiptNo && <p className="text-xs text-gray-300 font-mono mt-0.5">{p.receiptNo}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹{p.amount.toLocaleString('en-IN')}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────── */}
        {tab === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                  {student?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{student?.name}</h2>
                  <p className="text-sm text-gray-400">{student?.studentCode}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ['Mobile', student?.mobile],
                  ['Seat No', student?.seatNo || '—'],
                  ['Shift', student?.shift],
                  ['Shift Time', `${student?.shiftTime?.start} – ${student?.shiftTime?.end}`],
                  ['Monthly Fee', `₹${student?.monthlyFee}`],
                  ['Membership Expiry', student?.expiryDate ? new Date(student.expiryDate).toLocaleDateString('en-IN') : '—'],
                  ['Status', student?.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{k}</span>
                    <span className="text-sm font-medium text-gray-800 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3 rounded-2xl border border-red-100 hover:bg-red-100 transition"
            >
              <SignOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 shadow-xl">
        {[
          { id: 'home',       icon: LogIn,          label: 'Home' },
          { id: 'attendance', icon: CalendarCheck,   label: 'Attendance' },
          { id: 'payments',   icon: IndianRupee,     label: 'Payments' },
          { id: 'profile',    icon: User,            label: 'Profile' },
        ].map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
