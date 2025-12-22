import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL 
const API_URL = `${BASE_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const signupWithEmail = createAsyncThunk(
    "auth/signupWithEmail",
    async ({ email, password, name, role }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                name,
                role: role || "patient"
            });
            return null;
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



export const updateUserProfile = createAsyncThunk(
    "auth/updateUserProfile",
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/profile`, profileData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update profile"
            );
        }
    }
);

export const verifyEmailThunk = createAsyncThunk(
    "auth/verifyEmail",
    async ({ firebaseToken }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {
                firebaseToken
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Email verification failed"
            );
        }
    }
);

export const requestPasswordResetThunk = createAsyncThunk(
    "auth/requestPasswordReset",
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/request-password-reset`, {
                email
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Password reset request failed"
            );
        }
    }
);

export const resetPasswordThunk = createAsyncThunk(
    "auth/resetPassword",
    async ({ firebaseToken, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                firebaseToken,
                newPassword
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Password reset failed"
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
        },
        clearUser: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signupWithEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupWithEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.user = null;
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
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyEmailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecking = false;
            })
            .addCase(verifyEmailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(requestPasswordResetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestPasswordResetThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(requestPasswordResetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resetPasswordThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPasswordThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resetPasswordThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUser, setAuthChecking, clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;