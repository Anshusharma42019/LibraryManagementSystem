import api from './client';

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  registerSuperAdmin: (data) => api.post('/auth/register/superadmin', data),
};

// ─── Super Admin ─────────────────────────────────────────
export const superAdminAPI = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  getLibraries: (params) => api.get('/superadmin/libraries', { params }),
  createLibrary: (data) => api.post('/superadmin/libraries', data),
  updateLibrary: (id, data) => api.put(`/superadmin/libraries/${id}`, data),
  updateStatus: (id, status) => api.patch(`/superadmin/libraries/${id}/status`, { status }),
  deleteLibrary: (id) => api.delete(`/superadmin/libraries/${id}`),
};

// ─── Students ────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getExpiring: (days) => api.get('/students/expiring', { params: { days } }),
  getPendingFees: () => api.get('/students/pending-fees'),
};

// ─── Seats ───────────────────────────────────────────────
export const seatAPI = {
  getAll: (params) => api.get('/seats', { params }),
  create: (data) => api.post('/seats', data),
  update: (id, data) => api.put(`/seats/${id}`, data),
  delete: (id) => api.delete(`/seats/${id}`),
  bulkCreate: (data) => api.post('/seats/bulk', data),
};

// ─── Payments ────────────────────────────────────────────
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  collect: (data) => api.post('/payments', data),
  getSummary: () => api.get('/payments/summary'),
};

// ─── Attendance ──────────────────────────────────────────
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  bookSlot: (data) => api.post('/attendance/book-slot', data),
  getReport: (params) => api.get('/attendance/report', { params }),
  getTodaySummary: () => api.get('/attendance/today-summary'),
  getActiveCheckIns: () => api.get('/attendance/active-checkins'),
};

// ─── Expenses ────────────────────────────────────────────
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getSummary: () => api.get('/expenses/summary'),
};

// ─── Staff ───────────────────────────────────────────────
export const staffAPI = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

// ─── Student Portal ─────────────────────────────────
export const studentPortalAPI = {
  login: (data) => api.post('/student-portal/login', data),
  getMe: (token) => api.get('/student-portal/me', { headers: { Authorization: `Bearer ${token}` } }),
  checkIn: (token) => api.post('/student-portal/checkin', {}, { headers: { Authorization: `Bearer ${token}` } }),
  checkOut: (token) => api.post('/student-portal/checkout', {}, { headers: { Authorization: `Bearer ${token}` } }),
  getAttendance: (token, params) => api.get('/student-portal/attendance', { params, headers: { Authorization: `Bearer ${token}` } }),
  getPayments: (token) => api.get('/student-portal/payments', { headers: { Authorization: `Bearer ${token}` } }),
  setPin: (data) => api.post('/student-portal/set-pin', data),
};

// ─── Dashboard ───────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};
