import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const signupWithEmail = createAsyncThunk(
    "auth/signupWithEmail",
    async ({ email, password, role }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                role: role || "patient"
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Signup failed"
            );
        }
    }
);

export const loginWithEmail = createAsyncThunk(
    "auth/loginWithEmail",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

export const loginWithGoogle = createAsyncThunk(
    "auth/loginWithGoogle",
    async (role, { rejectWithValue }) => {
        try {
            if (!auth || !googleProvider) {
                return rejectWithValue("Firebase is not configured. Please check your environment variables.");
            }

            let result;
            try {
                result = await signInWithPopup(auth, googleProvider);
            } catch (firebaseError) {
                console.error("Firebase Sign-in Error:", firebaseError);
                if (firebaseError.code === 'auth/popup-closed-by-user') {
                    return rejectWithValue("Sign-in cancelled. Please try again.");
                }
                if (firebaseError.code === 'auth/popup-blocked') {
                    return rejectWithValue("Popup was blocked. Please allow popups for this site.");
                }
                if (firebaseError.code === 'auth/unauthorized-domain') {
                    return rejectWithValue("This domain is not authorized for Google Sign-in. Please check Firebase console settings.");
                }
                return rejectWithValue(firebaseError.message || "Google sign-in failed");
            }

            const firebaseToken = await result.user.getIdToken();

            const response = await axios.post(`${API_URL}/google-login`, {
                firebaseToken,
                role: role || "patient",
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                email: result.user.email
            });

            return response.data.user;
        } catch (error) {
            console.error("Google Login Failed", error);
            return rejectWithValue(
                error.response?.data?.message || error.message || "Google login failed"
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(`${API_URL}/logout`);
            return null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Logout failed"
            );
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/me`);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get user"
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        isAuthChecking: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthChecking = false;
        },
        setAuthChecking: (state, action) => {
            state.isAuthChecking = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signupWithEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupWithEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecking = false;
            })
            .addCase(signupWithEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginWithEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecking = false;
            })
            .addCase(loginWithEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginWithGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecking = false;
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload || "Logout failed. Please refresh.";
            })
            .addCase(getCurrentUser.pending, (state) => {
                state.isAuthChecking = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isAuthChecking = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isAuthChecking = false;
                state.user = null;
                state.error = null
            });
    },
});

export const { setUser, setAuthChecking, clearError } = authSlice.actions;
export default authSlice.reducer;