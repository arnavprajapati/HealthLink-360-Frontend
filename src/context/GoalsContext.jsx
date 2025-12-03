import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const GoalsContext = createContext();

const GOALS_API_URL = import.meta.env.VITE_API_URL?.replace('/health-logs', '/goals') || "http://localhost:5000/api/auth/goals";
axios.defaults.withCredentials = true;

export const GoalsProvider = ({ children }) => {
    const [goals, setGoals] = useState([]);
    const [currentGoal, setCurrentGoal] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create new goal
    const createGoal = useCallback(async (goalData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(GOALS_API_URL, goalData);
            setGoals(prev => [response.data.data, ...prev]);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to create goal";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get all goals
    const getGoals = useCallback(async (status = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(GOALS_API_URL, {
                params: { status: status === 'all' ? undefined : status }
            });
            setGoals(response.data.data);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch goals";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single goal
    const getGoalById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${GOALS_API_URL}/${id}`);
            setCurrentGoal(response.data.data);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch goal";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Edit goal
    const editGoal = useCallback(async (id, goalData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${GOALS_API_URL}/${id}`, goalData);
            setGoals(prev => prev.map(g => g._id === id ? response.data.data : g));
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to edit goal";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete goal
    const deleteGoal = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${GOALS_API_URL}/${id}`);
            setGoals(prev => prev.filter(g => g._id !== id));
            return id;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to delete goal";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update goal progress
    const updateGoalProgress = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${GOALS_API_URL}/${id}/progress`);
            setGoals(prev => prev.map(g => g._id === id ? response.data.data : g));
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update progress";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update all goals progress
    const updateAllGoalsProgress = useCallback(async () => {
        try {
            await axios.post(`${GOALS_API_URL}/update-all`);
            // Refresh goals after update
            await getGoals();
        } catch (err) {
            console.error('Failed to update all goals:', err);
        }
    }, [getGoals]);

    // Get goal statistics
    const getGoalStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${GOALS_API_URL}/stats`);
            setStats(response.data.data);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch stats";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add milestone to goal
    const addMilestone = useCallback(async (id, milestoneData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${GOALS_API_URL}/${id}/milestone`, milestoneData);
            setGoals(prev => prev.map(g => g._id === id ? response.data.data : g));
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to add milestone";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Analyze goal with Gemini AI
    const analyzeGoal = useCallback(async (id) => {
        try {
            const response = await axios.post(`${GOALS_API_URL}/${id}/analyze`);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to analyze goal";
            throw new Error(errorMsg);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        goals,
        currentGoal,
        stats,
        loading,
        error,
        createGoal,
        getGoals,
        getGoalById,
        editGoal,
        deleteGoal,
        updateGoalProgress,
        updateAllGoalsProgress,
        getGoalStats,
        addMilestone,
        analyzeGoal,
        clearError
    };

    return (
        <GoalsContext.Provider value={value}>
            {children}
        </GoalsContext.Provider>
    );
};

export const useGoals = () => {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error('useGoals must be used within a GoalsProvider');
    }
    return context;
};

export default GoalsContext;