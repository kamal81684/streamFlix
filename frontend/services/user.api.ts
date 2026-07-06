import api from "@/lib/axios";

export const getProfile = async () => {
    return await api.get("/users/profile");
};

export const updateProfile = async (data: {
    name: string;
    email?: string;
}) => {
    return await api.put("/users/profile", data);
};

export const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
}) => {
    return await api.put("/users/change-password", data);
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return await api.put("/users/avatar", formData);
};
