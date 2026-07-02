import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Loader2, KeyRound, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentPortalAPI } from '../../api/services';

export default function StudentLoginPage() {
  const [form, setForm] = useState({ studentCode: '', pin: '' });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentCode || !form.pin)
      return toast.error('Student code and PIN are required.');
    if (!/^\d{4}$/.test(form.pin))
      return toast.error('PIN must be 4 digits.');

    setLoading(true);
    try {
      const res = await studentPortalAPI.login({
        studentCode: form.studentCode.toUpperCase(),
        pin: form.pin,
      });
      const { token, student, todayStatus } = res.data.data;
      // Store in sessionStorage (clears on tab close)
      sessionStorage.setItem('studentToken', token);
      sessionStorage.setItem('studentData', JSON.stringify(student));
      toast.success(res.data.message);
      navigate('/student/portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
              <BookOpen className="text-white" size={26} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with your student code & PIN</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Code</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.studentCode}
                  onChange={e => setForm({ ...form, studentCode: e.target.value.toUpperCase() })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tracking-wider"
                  placeholder="STU-0001"
                  maxLength={12}
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Your code is on your library ID card</p>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">4-Digit PIN</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={form.pin}
                  onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm tracking-widest font-mono"
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
                <button type="button" onClick={() => setShowPin(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">PIN given by your library staff</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have a PIN? Ask your library staff to set one for you.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Library staff?{' '}
          <a href="/login" className="text-indigo-500 hover:underline font-medium">Staff Login →</a>
        </p>
      </div>
    </div>
  );
}
