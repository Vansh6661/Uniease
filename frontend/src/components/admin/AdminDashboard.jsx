import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchComplaints, updateComplaintStatus } from '../../services/api/complaintAPI';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch complaints on component mount and when filters change
  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);

    const filters = {};
    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }

    const result = await fetchComplaints(filters);

    if (result.success) {
      setComplaints(result.data || []);
    } else {
      setError(result.error || 'Failed to load complaints');
      setComplaints([]);
    }

    setLoading(false);
  };

  // Filter complaints by search term
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
      assigned: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Assigned' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resolved' },
      closed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Closed' },
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || colors.medium;
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    const result = await updateComplaintStatus(complaintId, newStatus, 'Updated by admin');

    if (result.success) {
      // Update local state
      setComplaints(
        complaints.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
    } else {
      setError(`Failed to update complaint: ${result.error}`);
    }

    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-slate-900">📋 Complaints Management</h1>
        <p className="text-slate-600 mt-1">Manage and track all complaints</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title or complaint ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={loadComplaints}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-600">Loading complaints...</p>
        </div>
      )}

      {/* Complaints Table */}
      {!loading && filteredComplaints.length > 0 && (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Priority</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => {
                const statusColor = getStatusColor(complaint.status);
                return (
                  <tr key={complaint.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-sm text-blue-600">
                      {complaint.complaint_number || complaint.id?.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{complaint.title}</td>
                    <td className="py-3 px-4 text-slate-700">{complaint.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        disabled={updatingId === complaint.id}
                        className={`px-3 py-1 rounded text-sm font-semibold ${statusColor.bg} ${statusColor.text} border-0 cursor-pointer disabled:opacity-50`}
                      >
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/complaint/${complaint.id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredComplaints.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-600 text-lg">
            {complaints.length === 0 ? 'No complaints found' : 'No complaints matching your search'}
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-slate-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-slate-900">{complaints.length}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm">Open</p>
          <p className="text-3xl font-bold text-blue-600">
            {complaints.filter((c) => c.status === 'open').length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">
            {complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-emerald-600">
            {complaints.filter((c) => c.status === 'resolved').length}
          </p>
        </div>
      </div>
    </div>
  );
}
