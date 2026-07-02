// Reusable UI Components

export const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

export const Badge = ({ text, type = 'default' }) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    trial: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    default: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${styles[type] || styles.default}`}>
      {text}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm ${error ? 'border-red-400' : 'border-gray-200'}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm bg-white ${error ? 'border-red-400' : 'border-gray-200'}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Button = ({ children, variant = 'primary', loading, icon: Icon, ...props }) => {
  const styles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant]}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};

export const Table = ({ columns, data, emptyMessage = 'No data found' }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="px-6 py-3 text-left">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">{emptyMessage}</td></tr>
        ) : data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition">
            {columns.map(col => (
              <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><Icon size={28} className="text-gray-400" /></div>}
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    {subtitle && <p className="text-sm text-gray-400 mt-1 mb-4">{subtitle}</p>}
    {action}
  </div>
);
