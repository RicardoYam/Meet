import apiClient from "./base";

export const getProfile = (username) => {
  return apiClient.get(`/profile`, {
    params: {
      username: username,
    },
  });
};

export const updateAvatar = (userId, avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return apiClient.put(`/profile?userId=${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `${token}`,
    },
  });
};
