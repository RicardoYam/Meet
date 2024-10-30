import apiClient from "./base";

export const getTags = () => {
  return apiClient.get("/tags");
};

export const getCategories = () => {
  return apiClient.get("/categories");
};

export const createPost = async (postData) => {
  try {
    const response = await apiClient.post("/posts", postData, {
      headers: {
        Authorization: `${
          localStorage.getItem("token") || sessionStorage.getItem("token")
        }`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = (page, size) => {
  return apiClient.get(`/posts?page=${page}&size=${size}`);
};

export const getPost = (postId) => {
  return apiClient.get(`/posts/${postId}`);
};

export const getComments = (postId) => {
  return apiClient.get(`/posts/${postId}/comments`);
};

export const createTopic = (topicData) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return apiClient.post("/tags", topicData, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export const createCategory = (categoryData) => {
  return apiClient.post("/categories", categoryData, {
    headers: {
      Authorization: `${
        localStorage.getItem("token") || sessionStorage.getItem("token")
      }`,
    },
  });
};

export const upVotePost = (blogId, userId) => {
  return apiClient.post(
    `/vote?blogId=${blogId}&userId=${userId}`,
    {},
    {
      headers: {
        Authorization: `${
          localStorage.getItem("token") || sessionStorage.getItem("token")
        }`,
      },
    }
  );
};
