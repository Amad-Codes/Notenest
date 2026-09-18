import { api } from "./axios";
import { ApiSuccess, User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async register(name: string, email: string, password: string) {
    const res = await api.post<ApiSuccess<AuthResponse>>("/auth/register", {
      name,
      email,
      password,
    });
    return res.data.data;
  },

  async login(email: string, password: string) {
    const res = await api.post<ApiSuccess<AuthResponse>>("/auth/login", { email, password });
    return res.data.data;
  },

  async me() {
    const res = await api.get<ApiSuccess<User>>("/auth/me");
    return res.data.data;
  },
};
