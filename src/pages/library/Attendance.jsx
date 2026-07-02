import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, CheckCircle, XCircle, Clock, LogIn, LogOut,
  CalendarPlus, Users, Zap, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI, studentAPI } from '../../api/services';
import { Button, Spinner, Badge } from '../../components/ui/index.jsx';

const SLOT_OPTIONS = [
  { value: 2, label: '2 Hours' },
  { value: 3, label: '3 Hours' },
  { value: 4, label: '4 Hours' },
  { value: 6, label: '6 Hours' },
  { value: 8, label: '8 Hours (Full Day)' },
];

const STATUS_COLORS = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  half_day: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-blue-100 text-blue-700',
  holiday: 'bg-gray-100 text-gray-600',
};

const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// ── Tab 1: Bulk Mark Attendance ────────────────────────────────────────────
function BulkMarkTab() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stuRes, attRes] = await Promise.all([
          studentAPI.getAll({ status: 'active', limit: 200 }),
          attendanceAPI.getAll({ date }),
        ]);
        const stuList = stuRes.data.data.students;
        setStudents(stuList);
        const map = {};
        (attRes.data.data || []).forEach(a => {
          const sid = typeof a.studentId === 'object' ? a.studentId._id : a.studentId;
          map[sid] = a.status;
        });
        stuList.forEach(s => { if (!map[s._id]) map[s._id] = 'present'; });
        setAttendance(map);
      } catch {
        toast.error('Failed to load attendance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const toggle = (id) =>
    setAttendance(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }));

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s._id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({ studentId: s._id, date, status: attendance[s._id] || 'present' }));
      await attendanceAPI.mark({ date, records });
      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-2 ml-auto flex-wrap">
          <Button variant="success" icon={CheckCircle} onClick={() => markAll('present')}>All Present</Button>
          <Button variant="danger" icon={XCircle} onClick={() => markAll('absent')}>All Absent</Button>
          <Button loading={saving} icon={CalendarCheck} onClick={handleSave}>Save</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: students.length, cls: 'bg-gray-50 text-gray-700' },
          { label: 'Present', value: presentCount, cls: 'bg-green-50 text-green-700' },
          { label: 'Absent', value: absentCount, cls: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Student List */}
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {students.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No active students found.</p>
          ) : students.map(s => {
            const isPresent = attendance[s._id] === 'present';
            return (
              <div key={s._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {s.seatNo ? `Seat ${s.seatNo}` : 'No seat'} • {s.shift}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(s._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition ${isPresent ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {isPresent ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {isPresent ? 'Present' : 'Absent'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Check In / Check Out ───────────────────────────────────────────
function CheckInOutTab() {
  const [students, setStudents] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stuRes, activeRes] = await Promise.all([
        studentAPI.getAll({ status: 'active', limit: 200 }),
        attendanceAPI.getActiveCheckIns(),
      ]);
      setStudents(stuRes.data.data.students);
      setActiveCheckIns(activeRes.data.data);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const checkedInIds = new Set(activeCheckIns.map(r => {
    const sid = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
    return sid;
  }));

  const handleCheckIn = async (studentId) => {
    setProcessing(studentId);
    try {
      const res = await attendanceAPI.checkIn({ studentId });
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleCheckOut = async (studentId) => {
    setProcessing(studentId);
    try {
      const res = await attendanceAPI.checkOut({ studentId });
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.seatNo && s.seatNo.toLowerCase().includes(search.toLowerCase())) ||
    s.mobile.includes(search)
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {/* Currently Inside */}
      {activeCheckIns.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-green-600" />
            <p className="text-sm font-semibold text-green-800">Currently Inside ({activeCheckIns.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCheckIns.map(r => {
              const st = r.studentId;
              const sid = typeof st === 'object' ? st._id : st;
              const name = typeof st === 'object' ? st.name : 'Student';
              const seat = typeof st === 'object' ? st.seatNo : '';
              return (
                <div key={r._id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-green-100">
                  <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-xs">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">In: {formatTime(r.checkIn)}{seat ? ` • ${seat}` : ''}</p>
                  </div>
                  <button
                    onClick={() => handleCheckOut(sid)}
                    disabled={processing === sid}
                    className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-lg hover:bg-red-200 transition font-medium"
                  >
                    {processing === sid ? '...' : 'Out'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Refresh */}
      <div className="flex gap-3">
        <input
          placeholder="Search student name, seat, mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={fetchData} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No students found.</p>
        ) : filtered.map(s => {
          const isIn = checkedInIds.has(s._id);
          const record = activeCheckIns.find(r => {
            const sid = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
            return sid === s._id;
          });
          const isProcessing = processing === s._id;
          return (
            <div key={s._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.seatNo ? `Seat ${s.seatNo}` : 'No seat'} • {s.shift}
                    {isIn && record && <span className="text-green-600 font-medium"> • In: {formatTime(record.checkIn)}</span>}
                  </p>
                </div>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => isIn ? handleCheckOut(s._id) : handleCheckIn(s._id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition ${
                  isIn
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {isProcessing ? (
                  <span>...</span>
                ) : isIn ? (
                  <><LogOut size={13} /> Check Out</>
                ) : (
                  <><LogIn size={13} /> Check In</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Slot Booking ───────────────────────────────────────────────────
function SlotBookingTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    bookedSlotHours: 2,
    slotStartTime: getCurrentTime(),
    notes: '',
  });
  const [slotEndTime, setSlotEndTime] = useState('');

  useEffect(() => {
    studentAPI.getAll({ status: 'active', limit: 200 })
      .then(res => setStudents(res.data.data.students))
      .catch(() => toast.error('Failed to load students.'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-calculate end time
  useEffect(() => {
    if (form.slotStartTime && form.bookedSlotHours) {
      const [h, m] = form.slotStartTime.split(':').map(Number);
      const total = h * 60 + m + Number(form.bookedSlotHours) * 60;
      const endH = Math.floor(total / 60) % 24;
      const endM = total % 60;
      setSlotEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  }, [form.slotStartTime, form.bookedSlotHours]);

  const handleBook = async () => {
    if (!form.studentId) return toast.error('Please select a student.');
    setSaving(true);
    try {
      const res = await attendanceAPI.bookSlot(form);
      toast.success(res.data.message);
      setForm(prev => ({ ...prev, studentId: '', notes: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.seatNo && s.seatNo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Book a Slot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
            <input
              placeholder="Search student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            {loading ? <Spinner /> : (
              <div className="border border-gray-200 rounded-xl max-h-44 overflow-y-auto">
                {filteredStudents.map(s => (
                  <button
                    key={s._id}
                    onClick={() => { setForm(prev => ({ ...prev, studentId: s._id })); setSearch(s.name); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition border-b border-gray-50 last:border-0 ${form.studentId === s._id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                  >
                    {s.name}
                    <span className="text-xs text-gray-400 ml-2">{s.seatNo ? `Seat ${s.seatNo}` : ''} • {s.shift}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slot Duration *</label>
              <div className="flex gap-2 flex-wrap">
                {SLOT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(prev => ({ ...prev, bookedSlotHours: opt.value }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                      form.bookedSlotHours === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
                <input
                  type="time"
                  value={form.slotStartTime}
                  onChange={e => setForm(prev => ({ ...prev, slotStartTime: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time (auto)</label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600 font-medium">
                  {slotEndTime || '—'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                placeholder="Optional notes..."
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {form.studentId && slotEndTime && (
          <div className="mt-4 bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={16} className="text-indigo-600 shrink-0" />
            <p className="text-sm text-indigo-800">
              <strong>{students.find(s => s._id === form.studentId)?.name}</strong> will be booked from{' '}
              <strong>{form.slotStartTime}</strong> to <strong>{slotEndTime}</strong>{' '}
              ({form.bookedSlotHours} hours) on <strong>{form.date}</strong>
            </p>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button loading={saving} icon={CalendarPlus} onClick={handleBook}>
            Book Slot
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Attendance Page ──────────────────────────────────────────────────
const TABS = [
  { id: 'bulk', label: 'Bulk Mark', icon: Users },
  { id: 'checkin', label: 'Check In/Out', icon: LogIn },
  { id: 'slot', label: 'Slot Booking', icon: Clock },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('bulk');

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Mark attendance, track check-ins, and book time slots</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-full sm:w-fit overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'bulk' && <BulkMarkTab />}
      {activeTab === 'checkin' && <CheckInOutTab />}
      {activeTab === 'slot' && <SlotBookingTab />}
    </div>
  );
}
