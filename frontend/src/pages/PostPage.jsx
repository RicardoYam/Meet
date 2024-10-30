import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPost, upVotePost } from "../api/blog";
import { getProfile } from "../api/user";
import {
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { ThumbUpOutlined, ThumbUp } from "@mui/icons-material";
import "./PostPage.css";
import { formatDate } from "../util/utils";

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upVotes, setUpVotes] = useState(0);
  const [error, setError] = useState({ open: false, message: "" });

  const userId = localStorage.getItem("id") || sessionStorage.getItem("id");
  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, profileResponse] = await Promise.all([
          getPost(postId),
          username ? getProfile(username) : Promise.resolve({ data: null }),
        ]);

        if (postResponse.status === 200) {
          setPost(postResponse.data);
          setUpVotes(postResponse.data.upVotes);

          // Check if user has voted
          if (profileResponse.data) {
            const hasVoted = profileResponse.data.votes?.some(
              (vote) => vote.blogId === parseInt(postId) && vote.upVote === true
            );
            setIsUpvoted(hasVoted);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, username]);

  const handleUpvote = async () => {
    if (!userId) {
      setError({
        open: true,
        message: "Please login to upvote posts",
      });
      return;
    }

    try {
      const response = await upVotePost(postId, userId);
      if (response.status === 200 || response.status === 201) {
        setIsUpvoted(!isUpvoted);
        setUpVotes((prev) => (isUpvoted ? prev - 1 : prev + 1));
      }
    } catch (error) {
      setError({
        open: true,
        message: error.response?.data?.message || "Failed to upvote post",
      });
    }
  };

  const handleCloseError = () => {
    setError({ open: false, message: "" });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return <Typography variant="h6">Post not found</Typography>;
  }

  return (
    <Box className="post-page-container">
      {/* Author Info */}
      <Box className="author-section">
        <Avatar
          src={post.authorAvatar}
          alt={post.author}
          sx={{ width: 40, height: 40 }}
        >
          {post.author[0].toUpperCase()}
        </Avatar>
        <Box ml={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            {post.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(post.createdTime)}
          </Typography>
        </Box>
      </Box>

      {/* Title */}
      <Typography variant="h4" className="post-title" mt={3} mb={2}>
        {post.title}
      </Typography>

      {/* Categories and Tags */}
      <Box className="tags-categories-section" mb={3}>
        {post.categories.map((category, index) => (
          <Chip
            key={`category-${index}`}
            label={category}
            color="primary"
            variant="outlined"
            className="category-chip"
          />
        ))}
        {post.tags.map((tag, index) => (
          <Chip
            key={`tag-${index}`}
            label={tag}
            variant="outlined"
            className="tag-chip"
          />
        ))}
      </Box>

      {/* Content */}
      <Box
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Votes Section */}
      <Box className="votes-section" mt={4}>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={handleUpvote}
            className={isUpvoted ? "text-purple-600" : ""}
          >
            {isUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
          </IconButton>
          <Typography variant="body2" mx={1}>
            {upVotes}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Comments Section */}
      <Box className="comments-section">
        <Typography variant="h6" gutterBottom>
          Comments ({post.comments.length})
        </Typography>
        {post.comments.length > 0 ? (
          post.comments.map((comment, index) => (
            <Box key={index} className="comment">
              <Typography variant="body1">{comment.content}</Typography>
              <Typography variant="caption" color="textSecondary">
                - {comment.author}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No comments yet
          </Typography>
        )}
      </Box>

      {/* Error Snackbar */}
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
    </Box>
  );
}

export default PostPage;
