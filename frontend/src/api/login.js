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

export const sendVerificationCode = (email) => {
  return apiClient.post(`/verification?toEmail=${encodeURIComponent(email)}`);
};

export const codeMatch = (code, userId) => {
  return apiClient.get(`/community/codeMatch?code=${code}&userId=${userId}`);
};

export const changePassword = (code, userId, password) => {
  return apiClient.post(`/changePassword?code=${code}`, {
    userId: userId,
    password: password,
  });
};
