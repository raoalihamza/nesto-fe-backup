"use client";

import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect, type ReactNode } from "react";
import { store, useAppDispatch } from "@/store";
import { restoreCredentials, logout } from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from "@react-oauth/google";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("nesto_access_token");
    if (!accessToken) return;

    authService
      .me()
      .then(({ user }) => {
        dispatch(restoreCredentials({ user, accessToken }));
      })
      .catch(() => {
        localStorage.removeItem("nesto_access_token");
        localStorage.removeItem("nesto_refresh_token");
        dispatch(logout());
      });
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
      >
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthInitializer>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
