import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import { getCategories } from "../api/blog";
import { getProfile, followCategory, unfollowCategory } from "../api/user";
import { useNavigate } from "react-router-dom";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [followedCategories, setFollowedCategories] = useState(new Set());
  const [error, setError] = useState(null);

  const isLoggedIn = Boolean(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories and user profile in parallel
        const [categoriesResponse, profileResponse] = await Promise.all([
          getCategories(),
          isLoggedIn ? getProfile(username) : Promise.resolve({ data: null }),
        ]);

        if (categoriesResponse.status === 200) {
          setCategories(categoriesResponse.data);
        }

        // Set followed categories from user profile
        if (profileResponse?.data?.categories) {
          const followedIds = new Set(
            profileResponse.data.categories.map((category) => category.id)
          );
          setFollowedCategories(followedIds);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    fetchData();
  }, [isLoggedIn, username]);

  const handleFollow = async (categoryId) => {
    if (!isLoggedIn) {
      setError("Please login to follow categories");
      return;
    }

    try {
      if (followedCategories.has(categoryId)) {
        await unfollowCategory(categoryId);
        setFollowedCategories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
      } else {
        await followCategory(categoryId);
        setFollowedCategories((prev) => new Set(prev).add(categoryId));
      }
    } catch (error) {
      console.error("Error following category:", error);
      setError("Failed to follow category");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Categories
      </Typography>

      {categories.map((category, index) => (
        <React.Fragment key={category.id}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={() => navigate(`/category/${category.title}`)}
              >
                {category.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: "600px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {category.description || `Explore ${category.title} content`}
              </Typography>
            </Box>

            <Button
              variant={
                followedCategories.has(category.id) ? "contained" : "outlined"
              }
              color="primary"
              disabled={!isLoggedIn}
              onClick={() => handleFollow(category.id)}
              sx={{
                minWidth: 100,
                borderRadius: "20px",
                textTransform: "none",
                backgroundColor: followedCategories.has(category.id)
                  ? "#9333ea"
                  : "white",
                color: followedCategories.has(category.id)
                  ? "white"
                  : "#9333ea",
                borderColor: followedCategories.has(category.id)
                  ? "#9333ea"
                  : "#9333ea",
                "&:hover": {
                  borderColor: followedCategories.has(category.id)
                    ? "#891fed"
                    : "#9333ea",
                  backgroundColor: followedCategories.has(category.id)
                    ? "#891fed"
                    : "#f5d7fc",
                },
              }}
            >
              {followedCategories.has(category.id) ? "Following" : "+ Follow"}
            </Button>
          </Box>
          {index < categories.length - 1 && <Divider />}
        </React.Fragment>
      ))}

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default Categories;
