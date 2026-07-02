import { useState, useEffect, useCallback } from 'react';
import { Armchair, Plus, Grid, List, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { seatAPI } from '../../api/services';
import { Badge, Button, Modal, Input, Select, Spinner, EmptyState } from '../../components/ui/index.jsx';

const SEAT_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'window', label: 'Window' },
];

export default function SeatsPage() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editSeat, setEditSeat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ seatNo: '', floor: 'Ground', section: 'A', type: 'standard', monthlyRent: '' });
  const [bulkForm, setBulkForm] = useState({ prefix: 'A', startNo: 1, count: 10, floor: 'Ground', section: 'A', type: 'standard', monthlyRent: '' });
  const [filterStatus, setFilterStatus] = useState('');

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await seatAPI.getAll({ status: filterStatus });
      setSeats(res.data.data || []);
    } catch {
      toast.error('Failed to load seats.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  const handleSave = async () => {
    if (!form.seatNo) return toast.error('Seat number is required.');
    setSaving(true);
    try {
      if (editSeat) {
        await seatAPI.update(editSeat._id, form);
        toast.success('Seat updated!');
      } else {
        await seatAPI.create(form);
        toast.success('Seat added!');
      }
      setShowModal(false);
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkForm.count || bulkForm.count < 1) return toast.error('Enter valid count.');
    setSaving(true);
    try {
      await seatAPI.bulkCreate(bulkForm);
      toast.success(`${bulkForm.count} seats created!`);
      setShowBulk(false);
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create seats.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this seat?')) return;
    try {
      await seatAPI.delete(id);
      toast.success('Seat deleted.');
      fetchSeats();
    } catch {
      toast.error('Cannot delete occupied seat.');
    }
  };

  const statusColor = {
    available: 'bg-green-100 border-green-300 text-green-700',
    occupied: 'bg-red-100 border-red-300 text-red-700',
    reserved: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    maintenance: 'bg-gray-100 border-gray-300 text-gray-500',
  };

  const stats = {
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    occupied: seats.filter(s => s.status === 'occupied').length,
    reserved: seats.filter(s => s.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seat Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all library seats</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Layers} onClick={() => setShowBulk(true)}>Bulk Add</Button>
          <Button icon={Plus} onClick={() => { setEditSeat(null); setForm({ seatNo: '', floor: 'Ground', section: 'A', type: 'standard', monthlyRent: '' }); setShowModal(true); }}>Add Seat</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Seats', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Available', value: stats.available, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Occupied', value: stats.occupied, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Reserved', value: stats.reserved, color: 'text-yellow-700', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <div className="ml-auto flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}><Grid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}><List size={16} /></button>
        </div>
      </div>

      {/* Seats Display */}
      {loading ? <Spinner /> : seats.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <EmptyState icon={Armchair} title="No seats added yet" subtitle="Add seats individually or use bulk add" action={<Button icon={Plus} onClick={() => setShowModal(true)}>Add Seat</Button>} />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {seats.map(seat => (
            <div
              key={seat._id}
              onClick={() => { setEditSeat(seat); setForm({ seatNo: seat.seatNo, floor: seat.floor, section: seat.section, type: seat.type, monthlyRent: seat.monthlyRent }); setShowModal(true); }}
              className={`border-2 rounded-xl p-3 cursor-pointer hover:shadow-md transition text-center ${statusColor[seat.status]}`}
            >
              <Armchair size={20} className="mx-auto mb-1" />
              <p className="text-xs font-bold">{seat.seatNo}</p>
              <p className="text-xs capitalize opacity-70">{seat.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Seat No</th>
                <th className="px-6 py-3 text-left">Floor</th>
                <th className="px-6 py-3 text-left">Section</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Rent</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {seats.map(seat => (
                <tr key={seat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{seat.seatNo}</td>
                  <td className="px-6 py-3 text-gray-500">{seat.floor}</td>
                  <td className="px-6 py-3 text-gray-500">{seat.section}</td>
                  <td className="px-6 py-3 capitalize text-gray-500">{seat.type}</td>
                  <td className="px-6 py-3">₹{seat.monthlyRent}</td>
                  <td className="px-6 py-3"><Badge text={seat.status} type={seat.status === 'available' ? 'active' : seat.status === 'occupied' ? 'expired' : 'default'} /></td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleDelete(seat._id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Seat Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(statusColor).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border-2 ${cls}`} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editSeat ? 'Edit Seat' : 'Add Seat'} size="sm">
        <div className="space-y-4">
          <Input label="Seat Number *" value={form.seatNo} onChange={e => setForm({ ...form, seatNo: e.target.value })} placeholder="A-01" />
          <Input label="Floor" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="Ground / 1st / 2nd" />
          <Input label="Section" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="A / B / C" />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={SEAT_TYPES} />
          <Input label="Monthly Rent (₹)" type="number" value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: e.target.value })} placeholder="800" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          {editSeat && <Button variant="danger" onClick={() => handleDelete(editSeat._id)}>Delete</Button>}
          <Button loading={saving} onClick={handleSave}>{editSeat ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Add Seats" size="sm">
        <div className="space-y-4">
          <Input label="Prefix (e.g. A, B, C)" value={bulkForm.prefix} onChange={e => setBulkForm({ ...bulkForm, prefix: e.target.value })} placeholder="A" />
          <Input label="Start Number" type="number" value={bulkForm.startNo} onChange={e => setBulkForm({ ...bulkForm, startNo: e.target.value })} />
          <Input label="How many seats?" type="number" value={bulkForm.count} onChange={e => setBulkForm({ ...bulkForm, count: e.target.value })} placeholder="10" />
          <Input label="Floor" value={bulkForm.floor} onChange={e => setBulkForm({ ...bulkForm, floor: e.target.value })} />
          <Select label="Type" value={bulkForm.type} onChange={e => setBulkForm({ ...bulkForm, type: e.target.value })} options={SEAT_TYPES} />
          <Input label="Monthly Rent (₹)" type="number" value={bulkForm.monthlyRent} onChange={e => setBulkForm({ ...bulkForm, monthlyRent: e.target.value })} />
          <p className="text-xs text-gray-400">This will create seats: {bulkForm.prefix}-{bulkForm.startNo} to {bulkForm.prefix}-{Number(bulkForm.startNo) + Number(bulkForm.count) - 1}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowBulk(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleBulkCreate}>Create {bulkForm.count} Seats</Button>
        </div>
      </Modal>
    </div>
  );
}
