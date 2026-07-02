import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Plus, Trash2, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../api/services';
import { Button, Modal, Input, Select, Spinner, EmptyState, Table, Badge } from '../../components/ui/index.jsx';

const CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'internet', label: 'Internet' },
  { value: 'salary', label: 'Salary' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const catColors = {
  rent: 'bg-purple-100 text-purple-700',
  electricity: 'bg-yellow-100 text-yellow-700',
  internet: 'bg-blue-100 text-blue-700',
  salary: 'bg-pink-100 text-pink-700',
  maintenance: 'bg-orange-100 text-orange-700',
  supplies: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], paymentMode: 'cash', notes: '' });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const [exp, sum] = await Promise.all([
        expenseAPI.getAll(),
        expenseAPI.getSummary(),
      ]);
      setExpenses(exp.data.data || []);
      setSummary(sum.data.data);
    } catch {
      toast.error('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSave = async () => {
    if (!form.title || !form.amount) return toast.error('Title and amount are required.');
    setSaving(true);
    try {
      await expenseAPI.create(form);
      toast.success('Expense added!');
      setShowModal(false);
      setForm({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], paymentMode: 'cash', notes: '' });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted.');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const thisMonthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    { key: 'title', label: 'Title', render: r => <span className="font-medium text-gray-900">{r.title}</span> },
    {
      key: 'category', label: 'Category',
      render: r => <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${catColors[r.category]}`}>{r.category}</span>
    },
    { key: 'amount', label: 'Amount', render: r => <span className="font-semibold text-red-600">-₹{r.amount.toLocaleString('en-IN')}</span> },
    { key: 'paymentMode', label: 'Mode', render: r => <Badge text={r.paymentMode} type="default" /> },
    { key: 'date', label: 'Date', render: r => <span className="text-gray-500 text-sm">{new Date(r.date).toLocaleDateString('en-IN')}</span> },
    {
      key: 'actions', label: '',
      render: r => <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Track all library expenses</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Expense</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{thisMonthTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sm:col-span-2">
          <p className="text-sm text-gray-500 mb-2">By Category</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.slice(0, 6).map(cat => {
              const total = expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0);
              return total > 0 ? (
                <div key={cat.value} className="text-center">
                  <p className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColors[cat.value]}`}>{cat.label}</p>
                  <p className="text-sm font-semibold mt-1">₹{total.toLocaleString('en-IN')}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? <Spinner /> : expenses.length === 0 ? (
          <EmptyState icon={TrendingDown} title="No expenses recorded" subtitle="Start tracking your library expenses" action={<Button icon={Plus} onClick={() => setShowModal(true)}>Add Expense</Button>} />
        ) : (
          <Table columns={columns} data={expenses} />
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense" size="sm">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Electricity Bill - January" />
          <Input label="Amount (₹) *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="2500" />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
          <Select label="Payment Mode" value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} options={PAYMENT_MODES} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Add Expense</Button>
        </div>
      </Modal>
    </div>
  );
}
