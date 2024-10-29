import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../api/blog";
import {
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import "./PostPage.css";
import { formatDate } from "../util/utils";
function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postResponse = await getPost(postId);
        if (postResponse.status === 200) {
          setPost(postResponse.data);
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

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
          <IconButton>
            <ThumbUp />
          </IconButton>
          <Typography variant="body2" mx={1}>
            {post.upVotes}
          </Typography>
          <IconButton>
            <ThumbDown />
          </IconButton>
          <Typography variant="body2" mx={1}>
            {post.downVotes}
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
    </Box>
  );
}

export default PostPage;
