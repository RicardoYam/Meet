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

  return apiClient.put(`/profile/avatar?userId=${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `${token}`,
    },
  });
};

export const updateBanner = (userId, bannerFile) => {
  const formData = new FormData();
  formData.append("banner", bannerFile);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return apiClient.put(`/profile/banner?userId=${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `${token}`,
    },
  });
};

export const followCategory = async (categoryId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  return apiClient.post(`/categories/${categoryId}?userId=${userId}`, null, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const unfollowCategory = async (categoryId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  return apiClient.delete(`/categories/${categoryId}?userId=${userId}`, null, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const followTopic = async (topicId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  return apiClient.post(`/tags/${topicId}?userId=${userId}`, null, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const unfollowTopic = async (topicId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  return apiClient.delete(`/tags/${topicId}?userId=${userId}`, null, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const updateBio = async (userId, username, bio) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("username", username);
  formData.append("bio", bio);

  return apiClient.put(`/profile`, formData, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const followUser = async (userId, targetId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return apiClient.post(`/follow/${userId}?targetId=${targetId}`, null, {
    headers: { Authorization: `${token}` },
  });
};

export const unfollowUser = async (userId, targetId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return apiClient.delete(`/follow/${userId}?targetId=${targetId}`, null, {
    headers: { Authorization: `${token}` },
  });
};
