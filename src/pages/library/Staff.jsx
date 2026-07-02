import { useState, useEffect } from 'react';
import { UserCog, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffAPI } from '../../api/services';
import { Button, Modal, Input, Spinner, EmptyState, Badge, Table } from '../../components/ui/index.jsx';

const PERMISSIONS = [
  { key: 'canManageStudents', label: 'Manage Students' },
  { key: 'canCollectFees', label: 'Collect Fees' },
  { key: 'canManageSeats', label: 'Manage Seats' },
  { key: 'canViewReports', label: 'View Reports' },
  { key: 'canManageExpenses', label: 'Manage Expenses' },
  { key: 'canManageStaff', label: 'Manage Staff' },
];

const defaultForm = {
  name: '', email: '', mobile: '', password: 'Staff@123',
  permissions: {
    canManageStudents: true, canCollectFees: true, canManageSeats: false,
    canViewReports: false, canManageExpenses: false, canManageStaff: false,
  },
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data.data || []);
    } catch {
      toast.error('Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openEdit = (s) => {
    setEditStaff(s);
    setForm({ name: s.name, email: s.email, mobile: s.mobile, password: '', permissions: s.permissions || defaultForm.permissions });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required.');
    setSaving(true);
    try {
      if (editStaff) {
        await staffAPI.update(editStaff._id, form);
        toast.success('Staff updated!');
      } else {
        await staffAPI.create(form);
        toast.success('Staff member added!');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await staffAPI.delete(id);
      toast.success('Staff removed.');
      fetchStaff();
    } catch {
      toast.error('Failed to remove staff.');
    }
  };

  const togglePermission = (key) => {
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  };

  const staffMobileRender = (r) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
            {r.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{r.name}</p>
            <p className="text-xs text-gray-400 truncate">{r.email} • {r.mobile}</p>
          </div>
        </div>
        <Badge text={r.isActive ? 'Active' : 'Inactive'} type={r.isActive ? 'active' : 'expired'} />
      </div>
      <div className="flex flex-wrap gap-1">
        {PERMISSIONS.filter(p => r.permissions?.[p.key]).map(p => (
          <span key={p.key} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{p.label}</span>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
        <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
      </div>
    </div>
  );

  const columns = [
    {
      key: 'name', label: 'Staff Member',
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
            {r.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      )
    },
    { key: 'mobile', label: 'Mobile', render: r => <span className="text-gray-600">{r.mobile}</span> },
    {
      key: 'permissions', label: 'Permissions',
      render: r => (
        <div className="flex flex-wrap gap-1">
          {PERMISSIONS.filter(p => r.permissions?.[p.key]).map(p => (
            <span key={p.key} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{p.label}</span>
          ))}
        </div>
      )
    },
    { key: 'isActive', label: 'Status', render: r => <Badge text={r.isActive ? 'Active' : 'Inactive'} type={r.isActive ? 'active' : 'expired'} /> },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage staff accounts and permissions</p>
        </div>
        <Button icon={Plus} onClick={() => { setEditStaff(null); setForm(defaultForm); setShowModal(true); }}>Add Staff</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? <Spinner /> : staff.length === 0 ? (
          <EmptyState icon={UserCog} title="No staff members" subtitle="Add staff to help manage your library" action={<Button icon={Plus} onClick={() => setShowModal(true)}>Add Staff</Button>} />
        ) : (
          <Table columns={columns} data={staff} mobileRender={staffMobileRender} />
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editStaff ? 'Edit Staff' : 'Add Staff Member'} size="md">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Singh" />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@library.com" />
          <Input label="Mobile" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="9876543210" />
          {!editStaff && <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Staff@123" />}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-indigo-500" />
              <label className="text-sm font-medium text-gray-700">Permissions</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map(p => (
                <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.permissions[p.key]}
                    onChange={() => togglePermission(p.key)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editStaff ? 'Update' : 'Add Staff'}</Button>
        </div>
      </Modal>
    </div>
  );
}
