import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, Power, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminAPI } from '../../api/services';
import { Badge, Button, Modal, Input, Select, Spinner, EmptyState, Table } from '../../components/ui/index.jsx';

const PLANS = [
  { value: 'Starter', label: 'Starter - ₹499/mo (50 seats)' },
  { value: 'Basic', label: 'Basic - ₹799/mo (100 seats)' },
  { value: 'Professional', label: 'Professional - ₹1499/mo (300 seats)' },
  { value: 'Enterprise', label: 'Enterprise - Custom' },
];

const defaultForm = {
  name: '', ownerName: '', email: '', mobile: '', address: '',
  city: '', state: '', pincode: '', gst: '', planName: 'Starter',
  subscriptionStart: new Date().toISOString().split('T')[0],
  subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  ownerPassword: 'Library@123',
};

export default function LibrariesPage() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editLib, setEditLib] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchLibraries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getLibraries({ search, status: statusFilter, page, limit: 10 });
      setLibraries(res.data.data.libraries);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load libraries.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchLibraries(); }, [fetchLibraries]);

  const openAdd = () => { setEditLib(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (lib) => {
    setEditLib(lib);
    setForm({
      name: lib.name, ownerName: lib.ownerName, email: lib.email,
      mobile: lib.mobile, address: lib.address, city: lib.city || '',
      state: lib.state || '', pincode: lib.pincode || '', gst: lib.gst || '',
      planName: lib.planName,
      subscriptionStart: lib.subscriptionStart?.split('T')[0] || '',
      subscriptionExpiry: lib.subscriptionExpiry?.split('T')[0] || '',
      ownerPassword: '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.ownerName || !form.email || !form.mobile || !form.address) {
      return toast.error('Please fill all required fields.');
    }
    setSaving(true);
    try {
      if (editLib) {
        await superAdminAPI.updateLibrary(editLib._id, form);
        toast.success('Library updated successfully!');
      } else {
        await superAdminAPI.createLibrary(form);
        toast.success('Library created! Owner login credentials sent.');
      }
      setShowModal(false);
      fetchLibraries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirm = window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this library?`);
    if (!confirm) return;
    try {
      await superAdminAPI.updateStatus(id, newStatus);
      toast.success(`Library ${newStatus === 'active' ? 'activated' : 'suspended'}.`);
      fetchLibraries();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this library? This action cannot be undone.')) return;
    try {
      await superAdminAPI.deleteLibrary(id);
      toast.success('Library deleted.');
      fetchLibraries();
    } catch {
      toast.error('Failed to delete library.');
    }
  };

  const columns = [
    { key: 'name', label: 'Library Name', render: r => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: 'ownerName', label: 'Owner' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'planName', label: 'Plan', render: r => <Badge text={r.planName} type="default" /> },
    { key: 'status', label: 'Status', render: r => <Badge text={r.status} type={r.status} /> },
    {
      key: 'subscriptionExpiry', label: 'Expiry',
      render: r => <span className="text-gray-500">{r.subscriptionExpiry ? new Date(r.subscriptionExpiry).toLocaleDateString('en-IN') : '—'}</span>
    },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 size={15} /></button>
          <button onClick={() => handleStatus(r._id, r.status)} className={`p-1.5 rounded-lg transition ${r.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}>
            <Power size={15} />
          </button>
          <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all libraries on the platform</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Library</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-xl px-3">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search library, owner, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 py-2 text-sm focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? <Spinner /> : libraries.length === 0 ? (
          <EmptyState icon={Building2} title="No libraries found" subtitle="Add your first library to get started" action={<Button icon={Plus} onClick={openAdd}>Add Library</Button>} />
        ) : (
          <>
            <Table columns={columns} data={libraries} />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Total: {pagination.total} libraries</p>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editLib ? 'Edit Library' : 'Add New Library'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Library Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="City Study Library" />
          <Input label="Owner Name *" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Rahul Sharma" />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="owner@library.com" />
          <Input label="Mobile *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="9876543210" />
          <div className="md:col-span-2">
            <Input label="Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123, Main Market" />
          </div>
          <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Delhi" />
          <Input label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Delhi" />
          <Input label="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="110001" />
          <Input label="GST (Optional)" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} placeholder="07ABCDE1234F1Z5" />
          <Select label="Subscription Plan" value={form.planName} onChange={e => setForm({ ...form, planName: e.target.value })} options={PLANS} />
          {!editLib && <Input label="Owner Password" type="password" value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Library@123" />}
          <Input label="Subscription Start" type="date" value={form.subscriptionStart} onChange={e => setForm({ ...form, subscriptionStart: e.target.value })} />
          <Input label="Subscription Expiry" type="date" value={form.subscriptionExpiry} onChange={e => setForm({ ...form, subscriptionExpiry: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editLib ? 'Update Library' : 'Create Library'}</Button>
        </div>
      </Modal>
    </div>
  );
}
