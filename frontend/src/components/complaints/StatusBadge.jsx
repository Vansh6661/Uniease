import React from 'react';

export default function StatusBadge({ status }) {
  const statusConfig = {
    open: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
    assigned: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Assigned' },
    in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resolved' },
    closed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Closed' },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
