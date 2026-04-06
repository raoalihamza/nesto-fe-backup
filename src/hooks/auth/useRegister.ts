"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { setCredentials, setError } from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import type { AuthSuccessResponse, ApiError } from "@/types/user";

export function useRegister(): UseMutationResult<
  AuthSuccessResponse,
  ApiError,
  { email: string; password: string; firstName: string; lastName: string }
> {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ email, password, firstName, lastName }) =>
      authService.register(email, password, firstName, lastName),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        })
      );
    },
    onError: (err) => {
      dispatch(setError(err.message));
    },
  });
}
