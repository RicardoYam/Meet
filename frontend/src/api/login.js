import apiClient from "./base";

export const login = (account, password) => {
  return apiClient.post("/login", { account, password });
};

export const signup = (username, email, password) => {
  return apiClient.post("/register", {
    username,
    email,
    password,
  });
};

export const oauthSignup = (username, email, password, token) => {
  return apiClient.post(`/oauth-register?token=${token}`, {
    username,
    email,
    password,
  });
};

export const sendVerificationCode = (email) => {
  return apiClient.get(`/reset-password?email=${encodeURIComponent(email)}`);
};

export const codeMatch = (email, code) => {
  return apiClient.post(`/reset-password?email=${email}&code=${code}`);
};

export const changePassword = (email, password) => {
  return apiClient.put(`/reset-password?email=${email}&password=${password}`);
};
