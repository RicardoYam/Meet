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
      <Card
        className="mb-4 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <Box className="flex">
          {firstImage && (
            <div className="flex justify-center items-center w-48 h-48">
              <img
                src={firstImage}
                alt="Post preview"
                className="w-40 h-40 object-cover rounded-xl"
              />
            </div>
          )}
          <Box className="flex-1 flex flex-col">
            <CardContent className="flex-1">
              <Box className="flex items-center gap-2 mb-2">
                <Avatar
                  src={
                    avatar ||
                    `https://ui-avatars.com/api/?name=${author}&background=4284f5&color=fff`
                  }
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="body2" className="font-medium">
                  {author}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  •
                </Typography>
                {categories && categories[0] && (
                  <Typography variant="body2" color="textSecondary">
                    {categories[0]}
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" className="mb-2 font-bold">
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="mb-4"
              >
                {textPreview}
              </Typography>
              <Box className="flex items-center gap-4 text-gray-500 pt-4">
                <Box className="flex items-center gap-2">
                  <AccessTimeIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {new Date(createdTime).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2" color="textSecondary">
                    {Math.ceil(textContent.length / 200)} min read
                  </Typography>
                </Box>
                <Box className="flex-grow" />
                <Box className="flex items-center gap-1 upvote-button">
                  <IconButton
                    size="small"
                    onClick={handleUpvote}
                    className={isUpvoted ? "text-purple-600" : ""}
                  >
                    {isUpvoted ? (
                      <ThumbUpIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <ThumbUpOutlinedIcon sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                  <Typography variant="body2">{upVotes}</Typography>
                </Box>
                <Box className="flex items-center gap-1 upvote-button">
                  <ChatBubbleOutlineIcon />
                  <Typography variant="body2">{comments}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Box>
        </Box>
      </Card>

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
