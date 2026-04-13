import { useContext, useCallback } from 'react';
import { ComplaintContext } from '../context/ComplaintContext';
import { createComplaint as createComplaintAPI, fetchComplaints as fetchComplaintsAPI } from '../services/api/complaintAPI';

export const useComplaint = () => {
  const context = useContext(ComplaintContext);

  if (!context) {
    throw new Error('useComplaint must be used within ComplaintProvider');
  }

  const { complaints, selectedComplaint, setSelectedComplaint, isLoading, setIsLoading, error, setError, addComplaint, updateComplaint, deleteComplaint } = context;

  const createComplaint = useCallback(async (complaintData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call actual API
      const result = await createComplaintAPI(complaintData);

      if (result.success) {
        addComplaint(result.data);
        return { success: true, complaint: result.data };
      } else {
        const errorMessage = result.error || 'Failed to create complaint';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create complaint';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [addComplaint, setIsLoading, setError]);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call actual API to fetch fresh data from database
      const result = await fetchComplaintsAPI();

      if (result.success) {
        // Replace context complaints with fresh data from API
        const fetchedComplaints = result.data || [];
        // Use setAllComplaints to replace the entire list
        context.setAllComplaints(fetchedComplaints);
        return { success: true, complaints: fetchedComplaints };
      } else {
        const errorMessage = result.error || 'Failed to fetch complaints';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch complaints';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [context, setIsLoading, setError]);

  return {
    complaints,
    selectedComplaint,
    setSelectedComplaint,
    isLoading,
    error,
    createComplaint,
    fetchComplaints,
    updateComplaint,
    deleteComplaint,
  };
};
