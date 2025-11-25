import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";

export const loginWithGoogle = createAsyncThunk("auth/loginWithGoogle", async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
    };
});

export const signupWithEmail = createAsyncThunk("auth/signupWithEmail", async ({ email, password }) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
    };
});

export const loginWithEmail = createAsyncThunk("auth/loginWithEmail", async ({ email, password }) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
    };
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    await signOut(auth);
});

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
            .addMatcher(
                (action) => action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith("/fulfilled"),
                (state, action) => {
                    state.loading = false;
                    if (action.payload) state.user = action.payload; 
                }
            )
            .addMatcher(
                (action) => action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                }
            );
    },
});

export const { setUser, setAuthChecking, clearError } = authSlice.actions;
export default authSlice.reducer;