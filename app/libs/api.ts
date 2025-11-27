/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "./cookies";
// Frontend API configuration to connect to your backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  provider: string;
  profile_picture?: string;
  created_at: string;
  last_login?: string;
}

export interface UpdateUserData {
  name: string;
}

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      signup: `${API_BASE_URL}/api/signup`,
      login: `${API_BASE_URL}/api/login`,
      google: `${API_BASE_URL}/api/google`,
    },
  },
};

// Generic API fetch helper with auth
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getCookie("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  /// Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "Something went wrong");
  }

  return response.json();
}

// User-specific API calls
export const userAPI = {
  async getCurrentUser(): Promise<User> {
    return apiFetch(`${API_BASE_URL}/api/me`);
  },

  async updateUser(userData: UpdateUserData): Promise<{ message: string }> {
    return apiFetch(`${API_BASE_URL}/api/update`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
};

// Auth-specific API calls
export const authAPI = {
  async signup(userData: { name: string; email: string; password: string }) {
    return apiFetch(apiConfig.endpoints.auth.signup, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: { email: string; password: string }) {
    return apiFetch(apiConfig.endpoints.auth.login, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async googleLogin(googleData: any) {
    return apiFetch(apiConfig.endpoints.auth.google, {
      method: "POST",
      body: JSON.stringify(googleData),
    });
  },
};
