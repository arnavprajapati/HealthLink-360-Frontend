import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const HealthContext = createContext();

const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";
const API_URL = `${BASE_API_URL}/health-logs`;

axios.defaults.withCredentials = true;

export const HealthProvider = ({ children }) => {
    const [logs, setLogs] = useState([]);
    const [currentLog, setCurrentLog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    const getCurrentVitals = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/vitals`);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch current vitals";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    }, []);

    const createManualLog = useCallback(async (vitalsData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/manual`, vitalsData);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to save manual vitals";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const createHealthLog = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setLogs(prevLogs => [response.data.data, ...prevLogs]); 
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to create health log";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const getHealthLogs = useCallback(async ({ diseaseType = 'all', page = 1, limit = 50 } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, {
                params: { diseaseType, page, limit }
            });
            setLogs(response.data.data);
            setPagination(response.data.pagination);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch health logs";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const getHealthLogById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            setCurrentLog(response.data.data);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch health log";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteHealthLog = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_URL}/${id}`);
            setLogs(prevLogs => prevLogs.filter(log => log._id !== id));
            return id;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to delete health log";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearCurrentLog = useCallback(() => {
        setCurrentLog(null);
    }, []);

    const value = {
        logs,
        currentLog,
        loading,
        error,
        pagination,
        createHealthLog,
        getHealthLogs,
        getHealthLogById,
        deleteHealthLog,
        getCurrentVitals, 
        createManualLog, 
        clearError,
        clearCurrentLog
    };

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => {
    const context = useContext(HealthContext);
    if (!context) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};

export default HealthContext;