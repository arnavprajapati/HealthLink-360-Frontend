import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const API_URL = `${BASE_URL}/api/connect`;
const APPOINTMENT_URL = `${BASE_URL}/api/appointments`;

axios.defaults.withCredentials = true;

// Patient: Send connection request
export const sendConnectionRequest = createAsyncThunk(
    "connection/sendRequest",
    async (doctorEmail, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/request`, { doctorEmail });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to send request"
            );
        }
    }
);

// Doctor: Get incoming requests
export const getIncomingRequests = createAsyncThunk(
    "connection/getIncomingRequests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/requests`);
            return response.data.requests;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch requests"
            );
        }
    }
);

// Doctor: Respond to request
export const respondToRequest = createAsyncThunk(
    "connection/respondToRequest",
    async ({ requestId, status }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/respond`, { requestId, status });
            return { requestId, status, message: response.data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to respond to request"
            );
        }
    }
);

// Doctor: Get linked patients
export const getLinkedPatients = createAsyncThunk(
    "connection/getLinkedPatients",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/patients`);
            return response.data.patients;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch patients"
            );
        }
    }
);

// Doctor: Get specific patient data
export const getPatientHealthData = createAsyncThunk(
    "connection/getPatientHealthData",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}/data`);
            return response.data.logs;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch patient data"
            );
        }
    }
);

// Doctor: Create Note
export const createNote = createAsyncThunk(
    "connection/createNote",
    async ({ patientId, title, description }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/notes`, { patientId, title, description });
            return response.data.note;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create note"
            );
        }
    }
);

// Doctor: Get Patient Notes
export const getPatientNotes = createAsyncThunk(
    "connection/getPatientNotes",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}/notes`);
            return response.data.notes;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch notes"
            );
        }
    }
);

// Patient: Get My Notes
export const getMyNotes = createAsyncThunk(
    "connection/getMyNotes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/my-notes`);
            return response.data.notes;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch notes"
            );
        }
    }
);

// Patient: Get linked doctors
export const getLinkedDoctors = createAsyncThunk(
    "connection/getLinkedDoctors",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/doctors`);
            return response.data.doctors;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch doctors"
            );
        }
    }
);

// Create Appointment
export const createAppointment = createAsyncThunk(
    "connection/createAppointment",
    async ({ patientId, date, time, type, notes }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${APPOINTMENT_URL}`, { patientId, date, time, type, notes });
            return response.data.appointment;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to schedule appointment"
            );
        }
    }
);

// Get Doctor Appointments
export const getDoctorAppointments = createAsyncThunk(
    "connection/getDoctorAppointments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${APPOINTMENT_URL}/doctor`);
            return response.data.appointments;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch appointments"
            );
        }
    }
);

// Get Patient Appointments
export const getPatientAppointments = createAsyncThunk(
    "connection/getPatientAppointments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${APPOINTMENT_URL}/patient`);
            return response.data.appointments;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch appointments"
            );
        }
    }
);

// Update Appointment Status
export const updateAppointmentStatus = createAsyncThunk(
    "connection/updateAppointmentStatus",
    async ({ appointmentId, status }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${APPOINTMENT_URL}/${appointmentId}/status`, { status });
            return response.data.appointment;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update appointment"
            );
        }
    }
);

// Generate AI Summary
export const generatePatientSummary = createAsyncThunk(
    "connection/generatePatientSummary",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/patient/${patientId}/ai-summary`);
            return response.data.summary;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to generate summary"
            );
        }
    }
);

const connectionSlice = createSlice({
    name: "connection",
    initialState: {
        incomingRequests: [],
        linkedPatients: [],
        linkedDoctors: [],
        patientLogs: [], // For doctor view
        patientNotes: [], // For doctor view
        myNotes: [], // For patient view
        appointments: [],
        aiSummary: null,
        loading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearConnectionMessage: (state) => {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Send Request
            .addCase(sendConnectionRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(sendConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(sendConnectionRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Incoming Requests
            .addCase(getIncomingRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(getIncomingRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.incomingRequests = action.payload;
            })
            .addCase(getIncomingRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Respond to Request
            .addCase(respondToRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(respondToRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                // Remove the request from the list
                state.incomingRequests = state.incomingRequests.filter(
                    req => req._id !== action.payload.requestId
                );
            })
            .addCase(respondToRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Linked Patients
            .addCase(getLinkedPatients.pending, (state) => {
                state.loading = true;
            })
            .addCase(getLinkedPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.linkedPatients = action.payload;
            })
            .addCase(getLinkedPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Linked Doctors
            .addCase(getLinkedDoctors.pending, (state) => {
                state.loading = true;
            })
            .addCase(getLinkedDoctors.fulfilled, (state, action) => {
                state.loading = false;
                state.linkedDoctors = action.payload;
            })
            .addCase(getLinkedDoctors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Patient Health Data
            .addCase(getPatientHealthData.pending, (state) => {
                state.loading = true;
                state.patientLogs = [];
            })
            .addCase(getPatientHealthData.fulfilled, (state, action) => {
                state.loading = false;
                state.patientLogs = action.payload;
            })
            .addCase(getPatientHealthData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Note
            .addCase(createNote.pending, (state) => {
                state.loading = true;
            })
            .addCase(createNote.fulfilled, (state, action) => {
                state.loading = false;
                state.patientNotes.unshift(action.payload);
                state.successMessage = 'Note added successfully';
            })
            .addCase(createNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Patient Notes
            .addCase(getPatientNotes.pending, (state) => {
                state.loading = true;
                state.patientNotes = [];
            })
            .addCase(getPatientNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.patientNotes = action.payload;
            })
            .addCase(getPatientNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get My Notes
            .addCase(getMyNotes.pending, (state) => {
                state.loading = true;
                state.myNotes = [];
            })
            .addCase(getMyNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.myNotes = action.payload;
            })
            .addCase(getMyNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Appointment
            .addCase(createAppointment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createAppointment.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments.push(action.payload);
                state.successMessage = 'Appointment scheduled successfully';
            })
            .addCase(createAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Doctor Appointments
            .addCase(getDoctorAppointments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getDoctorAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments = action.payload;
            })
            .addCase(getDoctorAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Patient Appointments
            .addCase(getPatientAppointments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPatientAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments = action.payload;
            })
            .addCase(getPatientAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Appointment Status
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
                const index = state.appointments.findIndex(app => app._id === action.payload._id);
                if (index !== -1) {
                    state.appointments[index] = action.payload;
                }
            })
            // Generate AI Summary
            .addCase(generatePatientSummary.pending, (state) => {
                state.loading = true;
                state.aiSummary = null;
            })
            .addCase(generatePatientSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.aiSummary = action.payload;
            })
            .addCase(generatePatientSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearConnectionMessage } = connectionSlice.actions;
export default connectionSlice.reducer;
