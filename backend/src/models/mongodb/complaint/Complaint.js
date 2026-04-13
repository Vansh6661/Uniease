const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaint_number: {
      type: String,
      unique: true,
      required: true,
    },
    student_id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Hostel & Accommodation',
        'Academic',
        'Canteen / Food',
        'Transport',
        'Infrastructure',
        'IT / Wi-Fi',
        'Medical',
        'Safety & Security',
        'Other',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assigned_to: {
      type: Number,
      default: null,
    },
    resolution: {
      type: String,
      default: null,
    },
    student_name: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
  },
  { collection: 'complaints', timestamps: false }
);

module.exports = mongoose.model('Complaint', complaintSchema);
