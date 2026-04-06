"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { authService } from "@/lib/api/auth.service";
import type { BackendUser, ApiError } from "@/types/user";

export function useMe(): UseQueryResult<{ user: BackendUser }, ApiError> {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
  });
}
