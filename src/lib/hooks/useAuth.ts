"use client";

import { useAppSelector, useAppDispatch } from "@/store";
import { setCredentials, logout, setLoading } from "@/store/slices/authSlice";
import { loginApi, registerApi } from "@/lib/api/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const response = await loginApi(email, password);
      dispatch(setCredentials({ user: response.user, token: response.token }));
    } catch {
      dispatch(setLoading(false));
      throw new Error("Login failed");
    }
  };

  const register = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const response = await registerApi(email, password);
      dispatch(setCredentials({ user: response.user, token: response.token }));
    } catch {
      dispatch(setLoading(false));
      throw new Error("Registration failed");
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    signOut,
  };
}
