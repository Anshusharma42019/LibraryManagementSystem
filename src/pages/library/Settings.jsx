import { useState } from 'react';
import { Settings, Save, Bell, Shield, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui/index.jsx';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function SettingsPage() {
  const { user, library, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState('library');
  const [saving, setSaving] = useState(false);

  const [libForm, setLibForm] = useState({
    name: library?.name || '',
    mobile: library?.mobile || '',
    address: library?.address || '',
    city: library?.city || '',
    state: library?.state || '',
    gst: library?.gst || '',
  });

  const [notifForm, setNotifForm] = useState({
    feeReminderDays: library?.settings?.feeReminderDays || 5,
    whatsappEnabled: library?.settings?.whatsappEnabled || false,
    smsEnabled: library?.settings?.smsEnabled || false,
    autoExpireStudents: library?.settings?.autoExpireStudents ?? true,
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const saveLibrary = async () => {
    setSaving(true);
    try {
      await api.put(`/library/settings`, libForm);
      await fetchMe();
      toast.success('Library settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/library/settings', { settings: notifForm });
      toast.success('Notification settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required.');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match.');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'library', label: 'Library Info', icon: Building2 },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your library preferences</p>
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

      {activeTab === 'library' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="font-semibold text-gray-900 mb-4">Library Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Library Name" value={libForm.name} onChange={e => setLibForm({ ...libForm, name: e.target.value })} />
            <Input label="Mobile" value={libForm.mobile} onChange={e => setLibForm({ ...libForm, mobile: e.target.value })} />
            <div className="md:col-span-2">
              <Input label="Address" value={libForm.address} onChange={e => setLibForm({ ...libForm, address: e.target.value })} />
            </div>
            <Input label="City" value={libForm.city} onChange={e => setLibForm({ ...libForm, city: e.target.value })} />
            <Input label="State" value={libForm.state} onChange={e => setLibForm({ ...libForm, state: e.target.value })} />
            <Input label="GST Number" value={libForm.gst} onChange={e => setLibForm({ ...libForm, gst: e.target.value })} placeholder="Optional" />
          </div>
          <div className="mt-4">
            <Button loading={saving} icon={Save} onClick={saveLibrary}>Save Changes</Button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <Input label="Fee Reminder (days before expiry)" type="number" value={notifForm.feeReminderDays} onChange={e => setNotifForm({ ...notifForm, feeReminderDays: e.target.value })} />
            {[
              { key: 'whatsappEnabled', label: 'WhatsApp Notifications', desc: 'Send fee reminders via WhatsApp' },
              { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Send SMS alerts to students' },
              { key: 'autoExpireStudents', label: 'Auto Expire Students', desc: 'Automatically mark students expired on due date' },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifForm[s.key]} onChange={() => setNotifForm(f => ({ ...f, [s.key]: !f[s.key] }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button loading={saving} icon={Save} onClick={saveNotifications}>Save Settings</Button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md">
          <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="Enter current password" />
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min 6 characters" />
            <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Repeat new password" />
          </div>
          <div className="mt-4">
            <Button loading={saving} icon={Shield} onClick={changePassword}>Change Password</Button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}
