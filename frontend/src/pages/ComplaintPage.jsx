import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useComplaint } from "../hooks/useComplaint";
import { useAuth } from "../hooks/useAuth";
import StatusBadge from "../components/complaints/StatusBadge";

export default function ComplaintPage() {
  const { complaints, isLoading, error, createComplaint, fetchComplaints } = useComplaint();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("new");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const categories = [
    "Hostel & Accommodation",
    "Academic",
    "Canteen / Food",
    "Transport",
    "Infrastructure",
    "IT / Wi-Fi",
    "Medical",
    "Safety & Security",
    "Other",
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // Fetch complaints on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Refresh complaints when tab changes to track
  useEffect(() => {
    if (activeTab === "track") {
      fetchComplaints();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const newErrors = {};
    if (!category) newErrors.category = "Please select a category";
    if (!title || title.length < 5) newErrors.title = "Title must be at least 5 characters";
    if (!description || description.length < 10)
      newErrors.description = "Description must be at least 10 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitLoading(true);

    try {
      const result = await createComplaint({
        title,
        description,
        category,
        priority,
      });

      if (result.success) {
        setCategory("");
        setTitle("");
        setDescription("");
        setPriority("medium");
        setErrors({});
        setSubmitSuccess("✅ Complaint filed successfully!");
        setActiveTab("track");
        setTimeout(() => setSubmitSuccess(""), 3000);
      } else {
        setSubmitError(result.error || "Failed to file complaint");
      }
    } catch (err) {
      setSubmitError(err.message || "An error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">📋 Complaints</h1>
        <p className="text-slate-600">Submit and track your complaints</p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4 flex gap-4">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "new"
              ? "bg-blue-100 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ➕ New Complaint
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "track"
              ? "bg-blue-100 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📝 My Complaints ({complaints.length})
        </button>
      </div>

      {/* New Complaint Tab */}
      {activeTab === "new" && (
        <div className="glass-card p-8 space-y-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900">File a Complaint</h2>

          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-sm">
              {submitSuccess}
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              Error: {error}
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Category *</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => ({ ...prev, category: null }));
              }}
              disabled={submitLoading}
              className={`w-full px-4 py-3 rounded-lg border bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 ${
                errors.category ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Priority *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={submitLoading}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Title *</label>
            <input
              type="text"
              placeholder="Brief title of the issue"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: null }));
              }}
              disabled={submitLoading}
              className={`w-full px-4 py-3 rounded-lg border bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 ${
                errors.title ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Description *</label>
            <textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: null }));
              }}
              disabled={submitLoading}
              rows="5"
              className={`w-full px-4 py-3 rounded-lg border bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none disabled:opacity-50 ${
                errors.description ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {submitLoading ? "Filing complaint..." : "Submit Complaint"}
          </button>
        </div>
      )}

      {/* Track Complaints Tab */}
      {activeTab === "track" && (
        <div className="space-y-4">
          {isLoading && (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-600">Loading complaints...</p>
            </div>
          )}

          {complaints.length === 0 && !isLoading && (
            <div className="glass-card p-8 text-center space-y-3">
              <p className="text-2xl">📪</p>
              <p className="text-slate-600">No complaints yet</p>
            </div>
          )}

          {complaints.map((complaint) => (
            <div key={complaint.id} className="glass-card p-6 space-y-3 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-mono text-sm text-blue-600">{complaint.complaint_number}</p>
                  <p className="text-xl font-bold text-slate-900">{complaint.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{complaint.category}</p>
                  {complaint.priority && (
                    <p className="text-xs text-slate-500 mt-2">
                      Priority: <span className="font-semibold capitalize">{complaint.priority}</span>
                    </p>
                  )}
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  📅 {new Date(complaint.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  to={`/complaint/${complaint.id}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
