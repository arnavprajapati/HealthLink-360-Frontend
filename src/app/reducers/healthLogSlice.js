import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/health-logs";

axios.defaults.withCredentials = true;

export const createHealthLog = createAsyncThunk(
    "healthLog/create",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create health log"
            );
        }
    }
);

export const getHealthLogs = createAsyncThunk(
    "healthLog/getAll",
    async ({ diseaseType = 'all', page = 1, limit = 50 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_URL, {
                params: { diseaseType, page, limit }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch health logs"
            );
        }
    }
);

export const getHealthLogById = createAsyncThunk(
    "healthLog/getById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch health log"
            );
        }
    }
);

export const deleteHealthLog = createAsyncThunk(
    "healthLog/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete health log"
            );
        }
    }
);

const healthLogSlice = createSlice({
    name: "healthLog",
    initialState: {
        logs: [],
        currentLog: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            pages: 1
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentLog: (state) => {
            state.currentLog = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createHealthLog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createHealthLog.fulfilled, (state, action) => {
                state.loading = false;
                state.logs.unshift(action.payload);
            })
            .addCase(createHealthLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getHealthLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHealthLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getHealthLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getHealthLogById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHealthLogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentLog = action.payload;
            })
            .addCase(getHealthLogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteHealthLog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteHealthLog.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = state.logs.filter(log => log._id !== action.payload);
            })
            .addCase(deleteHealthLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearCurrentLog } = healthLogSlice.actions;
export default healthLogSlice.reducer;