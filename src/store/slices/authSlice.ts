import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BackendUser } from "@/types/user";

interface AuthState {
  user: BackendUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: BackendUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("nesto_access_token", action.payload.accessToken);
        localStorage.setItem(
          "nesto_refresh_token",
          action.payload.refreshToken
        );
      }
    },
    restoreCredentials(
      state,
      action: PayloadAction<{ user: BackendUser; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("nesto_access_token");
        localStorage.removeItem("nesto_refresh_token");
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  restoreCredentials,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
