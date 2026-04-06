"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import type { ApiError } from "@/types/user";

export function useResendVerification(): UseMutationResult<
  void,
  ApiError,
  { email: string }
> {
  return useMutation({
    mutationFn: ({ email }) => authService.resendVerification(email),
  });
}
