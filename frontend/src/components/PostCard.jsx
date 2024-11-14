import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import { upVotePost } from "../api/blog";
import { getProfile } from "../api/user";

const PostCard = ({
  id,
  title,
  content,
  author,
  avatar,
  categories,
  upVotes: initialUpVotes,
  comments,
  createdTime,
}) => {
  const navigate = useNavigate();
  const [upVotes, setUpVotes] = useState(initialUpVotes);
  const [error, setError] = useState({ open: false, message: "" });
  const [userProfile, setUserProfile] = useState(null);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  // Fetch user profile and check votes
  useEffect(() => {
    if (username) {
      getProfile(username)
        .then((response) => {
          if (response.status === 200) {
            setUserProfile(response.data);
            // Check if user has voted for this post
            const hasVoted = response.data.votes?.some(
              (vote) => vote.blogId === id && vote.upVote === true
            );
            setIsUpvoted(hasVoted);
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [username, id]);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  const firstImage = tempDiv.querySelector("img")?.src;
  const textContent = tempDiv.textContent || tempDiv.innerText;
  const textPreview =
    textContent.slice(0, 100) + (textContent.length > 20 ? "..." : "");

  const handleCardClick = (e) => {
    if (e.target.closest(".upvote-button")) {
      return;
    }
    navigate(`/posts/${id}`);
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();

    if (!userId) {
      setError({
        open: true,
        message: "Please login to upvote posts",
      });
      return;
    }

    try {
      const response = await upVotePost(id, userId);

      if (response.status === 200 || response.status === 201) {
        setIsUpvoted(!isUpvoted);
        setUpVotes((prev) => (isUpvoted ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Upvote error:", error);
      setError({
        open: true,
        message: error.response?.data?.message || "Failed to upvote post",
      });
    }
  };

  const handleCloseError = () => {
    setError({ open: false, message: "" });
  };

  return (
    <>
      <Box
        onClick={handleCardClick}
        sx={{
          mb: 4,
          cursor: "pointer",
        }}
      >
        <Box className="flex">
          {firstImage && (
            <Box sx={{ width: 200, height: 134, mr: 3 }}>
              <img
                src={firstImage}
                alt="Post preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            {/* Author info */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                src={
                  avatar ||
                  `https://ui-avatars.com/api/?name=${author}&background=4284f5&color=fff`
                }
                sx={{
                  width: 24,
                  height: 24,
                  mr: 1,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${author}`);
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  mr: 1,
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${author}`);
                }}
              >
                {author}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              {categories && categories[0] && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {categories[0]}
                </Typography>
              )}
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              className="post-title"
              sx={{
                mb: 1,
                fontWeight: 500,
                fontSize: "1.25rem",
                transition: "color 0.2s",
              }}
            >
              {title}
            </Typography>

            {/* Content preview */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {textPreview}
            </Typography>

            {/* Stats and metadata */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTimeIcon
                  sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {new Date(createdTime).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <VisibilityIcon
                  sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.ceil(textContent.length / 600)} min read
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box
                className="upvote-button"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <IconButton
                  size="small"
                  onClick={handleUpvote}
                  sx={{
                    color: isUpvoted ? "#9333ea" : "text.secondary",
                    "&:hover": {
                      color: "#9333ea",
                    },
                  }}
                >
                  {isUpvoted ? (
                    <ThumbUpIcon fontSize="small" />
                  ) : (
                    <ThumbUpOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    color: isUpvoted ? "#9333ea" : "text.secondary",
                  }}
                >
                  {upVotes}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {comments}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={error.open}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PostCard;
