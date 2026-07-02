import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Armchair, X, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentAPI, seatAPI, studentPortalAPI } from '../../api/services';
import { Badge, Button, Modal, Input, Select, Spinner, EmptyState, Table } from '../../components/ui/index.jsx';

const SHIFTS = [
  { value: 'morning', label: 'Morning (6AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 10PM)' },
  { value: 'fullday', label: 'Full Day' },
];

const defaultForm = {
  name: '', mobile: '', email: '', fatherName: '', address: '',
  seatNo: '', seatId: '', shift: 'fullday', monthlyFee: '', depositAmount: '0',
  admissionDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  feesDueDate: '1', notes: '',
};

// ── Seat Picker Component ────────────────────────────────────────────────────
function SeatPicker({ value, seatId, onChange, editCurrentSeatNo }) {
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatSearch, setSeatSearch] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    setLoading(true);
    seatAPI.getAll({ status: 'available' })
      .then(res => setAvailableSeats(res.data.data || []))
      .catch(() => toast.error('Failed to load seats.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = availableSeats.filter(s =>
    s.seatNo.toLowerCase().includes(seatSearch.toLowerCase()) ||
    (s.section && s.section.toLowerCase().includes(seatSearch.toLowerCase()))
  );

  const typeColor = (type) => {
    const map = { window: 'text-blue-500', premium: 'text-yellow-500', cabin: 'text-purple-500', standard: 'text-green-500' };
    return map[type] || 'text-green-500';
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Seat Number
      </label>

      {/* Selected Seat Badge */}
      {value ? (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
            <Armchair size={15} className="text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">{value}</span>
            <button
              type="button"
              onClick={() => { onChange('', ''); setShowGrid(false); }}
              className="ml-1 text-indigo-300 hover:text-red-500 transition"
            >
              <X size={13} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowGrid(p => !p)}
            className="text-xs text-indigo-500 hover:underline"
          >
            {showGrid ? 'Close' : 'Change Seat'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          className="w-full flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition mb-2 bg-white"
        >
          <Armchair size={16} />
          Select an available seat...
        </button>
      )}

      {/* Seat Grid */}
      {showGrid && (
        <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                placeholder="Search seat no or section..."
                value={seatSearch}
                onChange={e => setSeatSearch(e.target.value)}
                className="flex-1 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => { setShowGrid(false); setSeatSearch(''); }}
              className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-xl"
            >
              <X size={14} />
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">
              {availableSeats.length === 0 ? 'No available seats. All seats are occupied.' : 'No seats match your search.'}
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-52 overflow-y-auto pr-1">
              {filtered.map(s => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    onChange(s.seatNo, s._id);
                    setShowGrid(false);
                    setSeatSearch('');
                  }}
                  title={`${s.seatNo} • ${s.type} • ₹${s.monthlyRent}/mo`}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border bg-white border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-xs font-medium text-gray-700 hover:text-indigo-700"
                >
                  <Armchair size={16} className={typeColor(s.type)} />
                  <span>{s.seatNo}</span>
                  {s.monthlyRent > 0 && (
                    <span className="text-gray-400 text-xs leading-none">₹{s.monthlyRent}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-200 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><Armchair size={11} className="text-green-500" /> Standard</span>
            <span className="flex items-center gap-1"><Armchair size={11} className="text-blue-500" /> Window</span>
            <span className="flex items-center gap-1"><Armchair size={11} className="text-yellow-500" /> Premium</span>
            <span className="flex items-center gap-1"><Armchair size={11} className="text-purple-500" /> Cabin</span>
            <span className="ml-auto font-medium text-gray-500">{filtered.length} available</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [pinModal, setPinModal]   = useState(false);
  const [pinStudent, setPinStudent] = useState(null);
  const [pinValue, setPinValue]   = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({ search, status: statusFilter, page, limit: 10 });
      setStudents(res.data.data.students);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openAdd = () => {
    setEditStudent(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setForm({
      name: s.name, mobile: s.mobile, email: s.email || '', fatherName: s.fatherName || '',
      address: s.address || '', seatNo: s.seatNo || '', seatId: s.seatId || '', shift: s.shift,
      monthlyFee: s.monthlyFee, depositAmount: s.depositAmount,
      admissionDate: s.admissionDate?.split('T')[0] || '',
      expiryDate: s.expiryDate?.split('T')[0] || '',
      feesDueDate: s.feesDueDate, notes: s.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.monthlyFee) {
      return toast.error('Name, mobile and fee are required.');
    }
    setSaving(true);
    try {
      if (editStudent) {
        await studentAPI.update(editStudent._id, form);
        toast.success('Student updated!');
      } else {
        await studentAPI.create(form);
        toast.success('Student added successfully!');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPin = async () => {
    if (!/^\d{4}$/.test(pinValue)) return toast.error('PIN must be exactly 4 digits.');
    try {
      await studentPortalAPI.setPin({ studentId: pinStudent._id, pin: pinValue });
      toast.success(`PIN set for ${pinStudent.name}!`);
      setPinModal(false); setPinValue(''); setPinStudent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set PIN.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student removed.');
      fetchStudents();
    } catch {
      toast.error('Failed to remove student.');
    }
  };

  const actionButtons = (r) => (
    <div className="flex items-center gap-2">
      <button onClick={() => { setSelectedStudent(r); setShowView(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Search size={14} /></button>
      <button onClick={() => openEdit(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 size={14} /></button>
      <button onClick={() => { setPinStudent(r); setPinValue(''); setPinModal(true); }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Set Student PIN"><KeyRound size={14} /></button>
      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
    </div>
  );

  const columns = [
    {
      key: 'name', label: 'Student',
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {r.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{r.name}</p>
            <p className="text-xs text-gray-400">{r.studentCode}</p>
          </div>
        </div>
      )
    },
    { key: 'mobile',     label: 'Mobile', render: r => <span className="text-gray-600">{r.mobile}</span> },
    { key: 'seatNo',     label: 'Seat',   render: r => r.seatNo ? <Badge text={`Seat ${r.seatNo}`} type="default" /> : <span className="text-gray-300">—</span> },
    { key: 'shift',      label: 'Shift',  render: r => <span className="capitalize text-gray-600">{r.shift}</span> },
    { key: 'monthlyFee', label: 'Fee',    render: r => <span className="font-medium text-gray-900">₹{r.monthlyFee}</span> },
    {
      key: 'expiryDate', label: 'Expiry',
      render: r => {
        const expired = new Date(r.expiryDate) < new Date();
        return <span className={`text-sm ${expired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '—'}</span>;
      }
    },
    { key: 'status',  label: 'Status',  render: r => <Badge text={r.status} type={r.status === 'active' ? 'active' : 'expired'} /> },
    { key: 'actions', label: 'Actions', render: actionButtons },
  ];

  const mobileRender = (r) => {
    const expired = new Date(r.expiryDate) < new Date();
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {r.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{r.name}</p>
              <p className="text-xs text-gray-400">{r.studentCode} • {r.mobile}</p>
            </div>
          </div>
          <Badge text={r.status} type={r.status === 'active' ? 'active' : 'expired'} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-400">Seat</p>
            <p className="font-medium text-gray-700">{r.seatNo || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-400">Fee</p>
            <p className="font-medium text-gray-700">₹{r.monthlyFee}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-400">Expiry</p>
            <p className={`font-medium ${expired ? 'text-red-500' : 'text-gray-700'}`}>
              {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
        </div>
        <div className="flex justify-end">{actionButtons(r)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all enrolled students</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Student</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-xl px-3">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search name, mobile, seat..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 py-2 text-sm focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="left">Left</option>
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
          <Users size={14} />
          <span>Total: {pagination.total || 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? <Spinner /> : students.length === 0 ? (
          <EmptyState icon={Users} title="No students found" subtitle="Add your first student to get started" action={<Button icon={Plus} onClick={openAdd}>Add Student</Button>} />
        ) : (
          <>
            <Table columns={columns} data={students} mobileRender={mobileRender} />
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">{pagination.total} students</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Prev</button>
                  <span className="px-3 py-1 text-sm">{page} / {pagination.pages}</span>
                  <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editStudent ? 'Edit Student' : 'Add New Student'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Amit Kumar" />
          <Input label="Mobile *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="9876543210" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="amit@email.com" />
          <Input label="Father's Name" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} placeholder="Suresh Kumar" />

          {/* Seat Picker — full width */}
          <SeatPicker
            value={form.seatNo}
            seatId={form.seatId}
            editCurrentSeatNo={editStudent?.seatNo}
            onChange={(seatNo, seatId) => setForm(prev => ({ ...prev, seatNo, seatId }))}
          />

          <Select label="Shift" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} options={SHIFTS} />
          <Input label="Monthly Fee (₹) *" type="number" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: e.target.value })} placeholder="800" />
          <Input label="Deposit (₹)" type="number" value={form.depositAmount} onChange={e => setForm({ ...form, depositAmount: e.target.value })} placeholder="500" />
          <Input label="Admission Date" type="date" value={form.admissionDate} onChange={e => setForm({ ...form, admissionDate: e.target.value })} />
          <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
          <Input label="Fee Due Date (day of month)" type="number" value={form.feesDueDate} onChange={e => setForm({ ...form, feesDueDate: e.target.value })} placeholder="1" />
          <div className="md:col-span-2">
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" rows={2} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editStudent ? 'Update' : 'Add Student'}</Button>
        </div>
      </Modal>

      {/* PIN Set Modal */}
      <Modal isOpen={pinModal} onClose={() => setPinModal(false)} title="Set Student PIN" size="sm">
        {pinStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                {pinStudent.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{pinStudent.name}</p>
                <p className="text-xs text-gray-500">{pinStudent.studentCode} • Seat {pinStudent.seatNo || '—'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">4-Digit PIN</label>
              <input
                type="number"
                value={pinValue}
                onChange={e => setPinValue(e.target.value.replace(/\D/g,'').slice(0,4))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
              />
              <p className="text-xs text-gray-400 mt-1.5">Student will use this PIN to login at <span className="font-mono text-indigo-500">/student</span></p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPinModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSetPin} icon={KeyRound} className="flex-1">Set PIN</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={showView} onClose={() => setShowView(false)} title="Student Details" size="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500">{selectedStudent.studentCode}</p>
                <Badge text={selectedStudent.status} type={selectedStudent.status === 'active' ? 'active' : 'expired'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Mobile', selectedStudent.mobile],
                ['Email', selectedStudent.email || '—'],
                ['Father', selectedStudent.fatherName || '—'],
                ['Seat No', selectedStudent.seatNo || '—'],
                ['Shift', selectedStudent.shift],
                ['Monthly Fee', `₹${selectedStudent.monthlyFee}`],
                ['Deposit', `₹${selectedStudent.depositAmount}`],
                ['Admission', selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString('en-IN') : '—'],
                ['Expiry', selectedStudent.expiryDate ? new Date(selectedStudent.expiryDate).toLocaleDateString('en-IN') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
