import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the stored JWT to every outgoing request, if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("notenest_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server ever says the session is invalid/expired, clear local
// auth state and bounce to the login screen so the user isn't stuck.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("notenest_token");
      localStorage.removeItem("notenest_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/** Pulls a human-readable message out of an Axios/API error. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message ?? "Something went wrong";
  }
  return "Something went wrong";
}
