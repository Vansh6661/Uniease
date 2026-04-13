import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchComplaintById } from "../services/api/complaintAPI";
import StatusBadge from "../components/complaints/StatusBadge";

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No complaint ID provided");
      setIsLoading(false);
      return;
    }

    const loadComplaint = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchComplaintById(id);
        if (result.success) {
          setComplaint(result.data.complaint || result.data);
        } else {
          setError(result.error || "Failed to load complaint");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaint();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-8 text-center">
          <p className="text-slate-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-8">
          <button
            onClick={() => navigate("/complaint")}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Complaints
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-8 text-center">
          <button
            onClick={() => navigate("/complaint")}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Complaints
          </button>
          <p className="text-slate-600">Complaint not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/complaint")}
        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
      >
        ← Back to Complaints
      </button>

      {/* Header */}
      <div className="glass-card p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-blue-600 mb-2">
              {complaint.complaint_number}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{complaint.title}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* History Section */}
          {complaint.history && complaint.history.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">History</h2>
              <div className="space-y-3">
                {complaint.history.map((entry, index) => (
                  <div key={index} className="border-l-4 border-blue-300 pl-4 py-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {entry.action || "Action"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {entry.userName} ({entry.userRole})
                    </p>
                    {entry.reason && (
                      <p className="text-sm text-slate-700 mt-1">{entry.reason}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(entry.createdAt || entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-4">
          {/* Category & Priority */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Category</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {complaint.category}
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Priority</p>
              <p className="text-lg font-semibold mt-1 capitalize">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    complaint.priority === "critical"
                      ? "bg-red-100 text-red-700"
                      : complaint.priority === "high"
                      ? "bg-orange-100 text-orange-700"
                      : complaint.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {complaint.priority}
                </span>
              </p>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
              <div className="mt-2">
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Created</p>
              <p className="text-sm text-slate-700 mt-1">
                {new Date(complaint.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {complaint.resolved_at && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Resolved</p>
                <p className="text-sm text-slate-700 mt-1">
                  {new Date(complaint.resolved_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Assigned To */}
          {complaint.assigned_user && (
            <div className="glass-card p-6 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">Assigned To</p>
              <div className="mt-2">
                <p className="font-semibold text-slate-900">{complaint.assigned_user.name}</p>
                <p className="text-sm text-slate-600">{complaint.assigned_user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
