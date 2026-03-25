import type { User } from "@/types/user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AuthResponse {
  user: User;
  token: string;
}

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

export const registerApi = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
};

export const socialLoginApi = async (
  provider: "google" | "facebook" | "apple"
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error("Social login failed");
  return res.json();
};
