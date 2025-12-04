import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/connect`;
const APPOINTMENT_URL = `${BASE_URL}/api/appointments`;

axios.defaults.withCredentials = true;

const ConnectionContext = createContext();

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnection must be used within a ConnectionProvider');
    }
    return context;
};

export const ConnectionProvider = ({ children }) => {
    // State
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [linkedPatients, setLinkedPatients] = useState([]);
    const [linkedDoctors, setLinkedDoctors] = useState([]);
    const [patientLogs, setPatientLogs] = useState([]);
    const [patientNotes, setPatientNotes] = useState([]);
    const [patientGoals, setPatientGoals] = useState([]);
    const [myNotes, setMyNotes] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [aiSummary, setAiSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Clear messages
    const clearConnectionMessage = useCallback(() => {
        setSuccessMessage(null);
        setError(null);
    }, []);

    // Patient: Send connection request
    const sendConnectionRequest = useCallback(async (doctorEmail) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await axios.post(`${API_URL}/request`, { doctorEmail });
            setSuccessMessage(response.data.message);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to send request";
            setError(errorMsg);
            throw errorMsg;
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Get incoming requests
    const getIncomingRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/requests`);
            setIncomingRequests(response.data.requests);
            return response.data.requests;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Respond to request
    const respondToRequest = useCallback(async ({ requestId, status }) => {
        setLoading(true);
        try {
            const response = await axios.put(`${API_URL}/respond`, { requestId, status });
            setSuccessMessage(response.data.message);
            // Remove from incoming requests
            setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to respond to request");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Get linked patients
    const getLinkedPatients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/patients`);
            setLinkedPatients(response.data.patients);
            return response.data.patients;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch patients");
        } finally {
            setLoading(false);
        }
    }, []);

    // Patient: Get linked doctors
    const getLinkedDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/doctors`);
            setLinkedDoctors(response.data.doctors);
            return response.data.doctors;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch doctors");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Get specific patient data
    const getPatientHealthData = useCallback(async (patientId) => {
        setLoading(true);
        setPatientLogs([]);
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}/data`);
            setPatientLogs(response.data.logs);
            return response.data.logs;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch patient data");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Create Note
    const createNote = useCallback(async ({ patientId, title, description }) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/notes`, { patientId, title, description });
            setPatientNotes(prev => [response.data.note, ...prev]);
            setSuccessMessage('Note added successfully');
            return response.data.note;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create note");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Get Patient Notes
    const getPatientNotes = useCallback(async (patientId) => {
        setLoading(true);
        setPatientNotes([]);
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}/notes`);
            setPatientNotes(response.data.notes);
            return response.data.notes;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    }, []);

    // Patient: Get My Notes
    const getMyNotes = useCallback(async () => {
        setLoading(true);
        setMyNotes([]);
        try {
            const response = await axios.get(`${API_URL}/my-notes`);
            setMyNotes(response.data.notes);
            return response.data.notes;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    }, []);

    // Create Appointment
    const createAppointment = useCallback(async ({ patientId, date, time, type, notes }) => {
        setLoading(true);
        try {
            const response = await axios.post(`${APPOINTMENT_URL}`, { patientId, date, time, type, notes });
            setAppointments(prev => [...prev, response.data.appointment]);
            setSuccessMessage('Appointment scheduled successfully');
            return response.data.appointment;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to schedule appointment");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get Doctor Appointments
    const getDoctorAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${APPOINTMENT_URL}/doctor`);
            setAppointments(response.data.appointments);
            return response.data.appointments;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    }, []);

    // Get Patient Appointments
    const getPatientAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${APPOINTMENT_URL}/patient`);
            setAppointments(response.data.appointments);
            return response.data.appointments;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    }, []);

    // Update Appointment Status
    const updateAppointmentStatus = useCallback(async ({ appointmentId, status }) => {
        try {
            const response = await axios.put(`${APPOINTMENT_URL}/${appointmentId}/status`, { status });
            setAppointments(prev =>
                prev.map(app => app._id === response.data.appointment._id ? response.data.appointment : app)
            );
            return response.data.appointment;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update appointment");
        }
    }, []);

    // Doctor: Get Patient Goals
    const getPatientGoals = useCallback(async (patientId) => {
        setLoading(true);
        setPatientGoals([]);
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}/goals`);
            setPatientGoals(response.data.goals);
            return response.data.goals;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch patient goals");
        } finally {
            setLoading(false);
        }
    }, []);

    // Doctor: Analyze Patient Goal with AI
    const analyzePatientGoal = useCallback(async (patientId, goalId) => {
        try {
            const response = await axios.post(`${API_URL}/patient/${patientId}/goals/${goalId}/analyze`);
            return response.data.analysis;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze goal");
            throw err;
        }
    }, []);

    // Generate AI Summary
    const generatePatientSummary = useCallback(async (patientId) => {
        setLoading(true);
        setAiSummary(null);
        try {
            const response = await axios.post(`${API_URL}/patient/${patientId}/ai-summary`);
            setAiSummary(response.data.summary);
            return response.data.summary;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate summary");
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        // State
        incomingRequests,
        linkedPatients,
        linkedDoctors,
        patientLogs,
        patientNotes,
        patientGoals,
        myNotes,
        appointments,
        aiSummary,
        loading,
        error,
        successMessage,
        // Actions
        clearConnectionMessage,
        sendConnectionRequest,
        getIncomingRequests,
        respondToRequest,
        getLinkedPatients,
        getLinkedDoctors,
        getPatientHealthData,
        getPatientGoals,
        analyzePatientGoal,
        createNote,
        getPatientNotes,
        getMyNotes,
        createAppointment,
        getDoctorAppointments,
        getPatientAppointments,
        updateAppointmentStatus,
        generatePatientSummary
    };

    return (
        <ConnectionContext.Provider value={value}>
            {children}
        </ConnectionContext.Provider>
    );
};

export default ConnectionContext;
