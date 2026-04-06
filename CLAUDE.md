# CLAUDE.md — Auth Section Update
# Replace the relevant sections in your existing CLAUDE.md with the content below.

---

## API Layer Architecture (CRITICAL — applies to ALL future API work)

### 3-Layer Pattern
```
src/lib/api/client.ts         ← centralized fetch wrapper (single source of truth)
src/lib/api/auth.service.ts   ← pure async functions for auth endpoints
src/hooks/auth/               ← TanStack Query hooks consumed by components
```

### client.ts responsibilities
- Prepends `NEXT_PUBLIC_API_URL` (staging: https://api.nesto-staging.thecbt.live/v1)
- Auto-injects `Authorization: Bearer <accessToken>` from localStorage
- On 401: reads refreshToken from localStorage → POST /auth/refresh → retries original request
- If refresh fails: clears localStorage tokens + dispatches `logout()` to Redux store + redirects to /login
- Throws typed `ApiError` with `{ message, code, status }` on all non-2xx responses

### Token Storage (CRITICAL)
- `accessToken` → Redux `authSlice.accessToken` (in-memory for components) + `localStorage` key `nesto_access_token`
- `refreshToken` → `localStorage` key `nesto_refresh_token` only
- On app boot: `AuthProvider` (in Providers.tsx or layout) reads localStorage and dispatches `restoreCredentials` to Redux
- `client.ts` reads tokens from localStorage directly (not from Redux store) to avoid circular deps

### Backend Auth API Base
- Staging: `https://api.nesto-staging.thecbt.live/v1`
- Env var: `NEXT_PUBLIC_API_URL`
- All auth routes: `POST /auth/register`, `POST /auth/login`, etc. (no `/api/` prefix)

---

## authSlice — Updated Shape
```ts
interface AuthState {
  user: BackendUser | null;      // matches backend /auth/me response
  accessToken: string | null;    // in-memory copy (localStorage is source of truth for client.ts)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```
Reducers: `setCredentials(user, accessToken)`, `logout()`, `restoreCredentials(user, accessToken)`, `setLoading`, `setError`, `clearError`

---

## Auth Routes Built
- `/login` — LoginForm wired to useLogin hook ✅
- `/register` — RegisterForm wired to useRegister hook ✅ (has firstName, lastName, email, password, confirmPassword)
- `/forgot-password` — ForgotPasswordForm, sends reset email ✅
- `/reset-password` — ResetPasswordForm, reads ?token= from URL ✅
- `/verify-email` — VerifyEmailScreen, auto-calls API on load, reads ?token= from URL, has resend option ✅

## Auth Functions Written (no page yet)
- `authService.me()` — GET /auth/me (profile page TBD)
- `authService.updateMe()` — PATCH /auth/me (profile page TBD)
- `authService.changePassword()` — POST /auth/change-password (profile page TBD)
- `authService.logoutAll()` — POST /auth/logout-all (settings page TBD)

## Social Login
- Buttons exist in UI (SocialLoginButtons component) but show "Coming soon" toast — NOT implemented

---

## Hooks Location
- Auth hooks: `src/hooks/auth/` (NOT `src/lib/hooks/`)
- `src/lib/hooks/useAuth.ts` — DELETED (replaced by individual hooks)