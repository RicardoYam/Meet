import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import { getTags } from "../api/blog";
import { getProfile, followTopic, unfollowTopic } from "../api/user";
import { useNavigate } from "react-router-dom";

function Topics() {
  const [topics, setTopics] = useState([]);
  const [followedTopics, setFollowedTopics] = useState(new Set());
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
        // Fetch all topics and user profile in parallel
        const [tagsResponse, profileResponse] = await Promise.all([
          getTags(),
          isLoggedIn ? getProfile(username) : Promise.resolve({ data: null }),
        ]);

        if (tagsResponse.status === 200) {
          setTopics(tagsResponse.data);
        }

        // Set followed topics from user profile
        if (profileResponse?.data?.tags) {
          const followedIds = new Set(
            profileResponse.data.tags.map((tag) => tag.id)
          );
          setFollowedTopics(followedIds);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError("Failed to load topics");
      }
    };

    fetchData();
  }, [isLoggedIn, username]);

  const handleFollow = async (topicId) => {
    if (!isLoggedIn) {
      setError("Please login to follow topics");
      return;
    }

    try {
      if (followedTopics.has(topicId)) {
        await unfollowTopic(topicId);
        setFollowedTopics((prev) => {
          const newSet = new Set(prev);
          newSet.delete(topicId);
          return newSet;
        });
      } else {
        await followTopic(topicId);
        setFollowedTopics((prev) => new Set(prev).add(topicId));
      }
    } catch (error) {
      console.error("Error following topic:", error);
      setError("Failed to follow topic");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Topics
      </Typography>

      {topics.map((topic, index) => (
        <React.Fragment key={topic.id}>
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
                onClick={() => navigate(`/tag/${topic.title}`)}
              >
                #{topic.title}
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
                {topic.description || `Explore content about ${topic.title}`}
              </Typography>
            </Box>

            <Button
              variant={followedTopics.has(topic.id) ? "contained" : "outlined"}
              color="primary"
              disabled={!isLoggedIn}
              onClick={() => handleFollow(topic.id)}
              sx={{
                minWidth: 100,
                borderRadius: "20px",
                textTransform: "none",
                color: followedTopics.has(topic.id) ? "white" : "#9333ea",
                backgroundColor: followedTopics.has(topic.id)
                  ? "#9333ea"
                  : "white",
                borderColor: followedTopics.has(topic.id)
                  ? "#9333ea"
                  : "#9333ea",
                "&:hover": {
                  borderColor: followedTopics.has(topic.id)
                    ? "#891fed"
                    : "#9333ea",
                  backgroundColor: followedTopics.has(topic.id)
                    ? "#891fed"
                    : "#f5d7fc",
                },
              }}
            >
              {followedTopics.has(topic.id) ? "Following" : "+ Follow"}
            </Button>
          </Box>
          {index < topics.length - 1 && <Divider />}
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

export default Topics;
