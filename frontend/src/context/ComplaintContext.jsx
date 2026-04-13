import React, { createContext, useState, useCallback } from 'react';

export const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addComplaint = useCallback((complaint) => {
    setComplaints((prev) => [complaint, ...prev]);
  }, []);

  const setAllComplaints = useCallback((complaintsList) => {
    setComplaints(complaintsList);
  }, []);

  const updateComplaint = useCallback((id, updates) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id ? { ...complaint, ...updates } : complaint
      )
    );
  }, []);

  const deleteComplaint = useCallback((id) => {
    setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
  }, []);

  const value = {
    complaints,
    selectedComplaint,
    setSelectedComplaint,
    isLoading,
    setIsLoading,
    error,
    setError,
    addComplaint,
    setAllComplaints,
    updateComplaint,
    deleteComplaint,
  };

  return (
    <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>
  );
};
