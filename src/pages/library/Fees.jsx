import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Plus, Search, Download, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentAPI, studentAPI } from '../../api/services';
import { Badge, Button, Modal, Input, Select, Spinner, EmptyState, Table } from '../../components/ui/index.jsx';

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'online', label: 'Online Transfer' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2024, i, 1);
  return { value: d.toISOString().split('T')[0], label: d.toLocaleString('default', { month: 'long', year: 'numeric' }) };
});

export default function FeesPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    studentId: '', amount: '', paymentMode: 'cash', paymentType: 'monthly_fee',
    paymentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    forMonth: new Date().toISOString().split('T')[0],
    transactionId: '', notes: '',
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const [pmts, sum] = await Promise.all([
        paymentAPI.getAll({ page, limit: 15 }),
        paymentAPI.getSummary(),
      ]);
      setPayments(pmts.data.data.payments);
      setPagination(pmts.data.data.pagination);
      setSummary(sum.data.data);
    } catch {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const searchStudents = async (q) => {
    if (!q) return setStudents([]);
    try {
      const res = await studentAPI.getAll({ search: q, status: 'active', limit: 5 });
      setStudents(res.data.data.students);
    } catch {}
  };

  const selectStudent = (s) => {
    setSelectedStudent(s);
    setForm(f => ({ ...f, studentId: s._id, amount: s.monthlyFee }));
    setStudents([]);
    setStudentSearch(s.name);
  };

  const handleCollect = async () => {
    if (!form.studentId || !form.amount) return toast.error('Select student and enter amount.');
    setSaving(true);
    try {
      await paymentAPI.collect(form);
      toast.success('Payment recorded successfully!');
      setShowModal(false);
      setSelectedStudent(null);
      setStudentSearch('');
      setForm({ studentId: '', amount: '', paymentMode: 'cash', paymentType: 'monthly_fee', paymentMonth: '', forMonth: new Date().toISOString().split('T')[0], transactionId: '', notes: '' });
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'receipt', label: 'Receipt',
      render: r => <span className="font-mono text-xs text-gray-500">{r.receiptNo}</span>
    },
    {
      key: 'student', label: 'Student',
      render: r => (
        <div>
          <p className="font-medium text-gray-900">{r.studentName}</p>
          <p className="text-xs text-gray-400">Seat {r.seatNo || '—'}</p>
        </div>
      )
    },
    { key: 'amount', label: 'Amount', render: r => <span className="font-semibold text-green-600">₹{r.amount.toLocaleString('en-IN')}</span> },
    { key: 'paymentMonth', label: 'For Month', render: r => <span className="text-gray-600">{r.paymentMonth || '—'}</span> },
    { key: 'paymentMode', label: 'Mode', render: r => <Badge text={r.paymentMode} type="default" /> },
    { key: 'status', label: 'Status', render: r => <Badge text={r.status} type={r.status === 'paid' ? 'active' : 'pending'} /> },
    { key: 'paidAt', label: 'Date', render: r => <span className="text-gray-500 text-sm">{new Date(r.paidAt).toLocaleDateString('en-IN')}</span> },
    { key: 'collectedBy', label: 'Collected By', render: r => <span className="text-gray-500 text-xs">{r.collectedBy?.name || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all fee payments</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Collect Fee</Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{(summary.thisMonth?.total || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-green-600 mt-1">{summary.thisMonth?.count || 0} payments collected</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">All Time Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{(summary.allTime?.total || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">By Payment Mode</p>
            {(summary.byPaymentMode || []).map(m => (
              <div key={m._id} className="flex justify-between text-sm mb-1">
                <span className="capitalize text-gray-600">{m._id}</span>
                <span className="font-medium">₹{m.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? <Spinner /> : payments.length === 0 ? (
          <EmptyState icon={IndianRupee} title="No payments yet" subtitle="Collect your first fee payment" action={<Button icon={Plus} onClick={() => setShowModal(true)}>Collect Fee</Button>} />
        ) : (
          <>
            <Table columns={columns} data={payments} />
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">{pagination.total} payments</p>
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

      {/* Collect Fee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Collect Fee Payment" size="md">
        <div className="space-y-4">
          {/* Student Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student *</label>
            <input
              value={studentSearch}
              onChange={e => { setStudentSearch(e.target.value); searchStudents(e.target.value); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Type student name or mobile..."
            />
            {students.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                {students.map(s => (
                  <button key={s._id} onClick={() => selectStudent(s)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.mobile} • Seat {s.seatNo || '—'}</p>
                    </div>
                    <span className="text-indigo-600 font-medium">₹{s.monthlyFee}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-indigo-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-indigo-900">{selectedStudent.name}</p>
                <p className="text-xs text-indigo-600">{selectedStudent.mobile} • Seat {selectedStudent.seatNo || 'Not assigned'}</p>
              </div>
              <CheckCircle size={20} className="text-indigo-600" />
            </div>
          )}

          <Input label="Amount (₹) *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="800" />
          <Select label="Payment Mode" value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} options={PAYMENT_MODES} />
          <Select label="Payment Type" value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} options={[
            { value: 'monthly_fee', label: 'Monthly Fee' },
            { value: 'deposit', label: 'Deposit' },
            { value: 'fine', label: 'Fine' },
            { value: 'other', label: 'Other' },
          ]} />
          <Input label="Payment Month" value={form.paymentMonth} onChange={e => setForm({ ...form, paymentMonth: e.target.value })} placeholder="January 2024" />
          {(form.paymentMode === 'upi' || form.paymentMode === 'online') && (
            <Input label="Transaction ID" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} placeholder="UTR/Transaction ID" />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saving} icon={CheckCircle} onClick={handleCollect}>Collect Payment</Button>
        </div>
      </Modal>
    </div>
  );
}
