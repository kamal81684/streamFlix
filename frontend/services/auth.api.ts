import api from "@/lib/axios";
import {
    LoginRequest,
    RegisterRequest,
} from "@/types/auth.types";

export const register = async (data: RegisterRequest) => {
    return await api.post("/auth/register", data);
};

export const login = async (data: LoginRequest) => {
    return await api.post("/auth/login", data);
};

export const logout = async () => {
    return await api.post("/auth/logout");
};

export const refreshToken = async () => {
    return await api.post("/auth/refresh-token");
};

export const getProfile = async () => {
    return await api.get("/users/profile");
};

export const updateProfile = async (data: { name: string; email: string }) =>
    api.put("/users/profile", data);
export const changePassword = async (data: { currentPassword: string; newPassword: string }) =>
    api.put("/users/change-password", data);