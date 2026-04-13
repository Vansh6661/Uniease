import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/admin/AdminDashboard';
import { APP_ROLES } from '../utils/roles';

export default function AdminPage() {
  const { user } = useAuth();

  if (!user || user.appRole !== APP_ROLES.ADMIN) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-12 text-center space-y-4">
          <p className="text-4xl">🚫</p>
          <p className="text-xl font-bold text-slate-900">Access Denied</p>
          <p className="text-slate-600">Only admin members can access this page.</p>
          <p className="text-xs text-slate-500">Your role: {user?.appRole || 'unknown'}</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
