import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost, upVotePost, postComment } from "../api/blog";
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
  TextField,
  Button,
} from "@mui/material";
import { ThumbUpOutlined, ThumbUp } from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import "./PostPage.css";
import { formatDate, formatRelativeTime } from "../util/utils";
import "../styles/content.css";

// Move organizeComments outside of any component
const organizeComments = (comments) => {
  if (!Array.isArray(comments)) return [];

  const commentMap = new Map();
  const topLevelComments = [];

  // First pass: Create a map of all comments
  comments.forEach((comment) => {
    if (typeof comment === "object" && comment !== null) {
      const commentObj = { ...comment, replies: [] };
      commentMap.set(comment.id, commentObj);
    }
  });

  // Second pass: Organize comments into a tree structure
  comments.forEach((comment) => {
    if (typeof comment === "object" && comment !== null) {
      if (comment.parentCommentId === null) {
        topLevelComments.push(commentMap.get(comment.id));
      } else {
        const parentComment = commentMap.get(comment.parentCommentId);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id));
        }
      }
    }
  });

  return topLevelComments;
};

// Comment component
const Comment = ({ comment, postId, onCommentAdd, setError }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const navigate = useNavigate();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    const scrollPosition = window.scrollY;

    try {
      const response = await postComment(postId, comment.id, replyContent);
      if (response.status === 201) {
        const updatedPostResponse = await getPost(postId);
        if (updatedPostResponse.status === 200) {
          onCommentAdd(updatedPostResponse.data.comments);
          setReplyContent("");
          setShowReplyInput(false);

          setTimeout(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "instant",
            });
          }, 0);
        }
      }
    } catch (error) {
      setError({
        open: true,
        message: error.response?.data?.message || "Failed to post reply",
      });
    }
  };

  return (
    <Box className="comment" sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar
          src={
            comment.authorAvatar ||
            `https://ui-avatars.com/api/?name=${comment.author}&background=4284f5&color=fff`
          }
          alt={comment.author}
          sx={{
            width: 24,
            height: 24,
            mr: 1,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
          onClick={() => navigate(`/profile/${comment.author}`)}
        >
          {comment.author[0].toUpperCase()}
        </Avatar>
        <Typography
          variant="subtitle2"
          sx={{
            cursor: "pointer",
            "&:hover": {
              color: "primary.main",
            },
          }}
          onClick={() => navigate(`/profile/${comment.author}`)}
        >
          {comment.author}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {formatRelativeTime(comment.createdTime)}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ ml: 4 }}>
        {comment.content}
      </Typography>

      {/* Reply button */}
      <Button
        size="small"
        sx={{ ml: 4, mt: 1 }}
        onClick={() => setShowReplyInput(!showReplyInput)}
      >
        Reply
      </Button>

      {/* Simplified Reply input TextField */}
      {showReplyInput && (
        <Box sx={{ ml: 4, mt: 1, display: "flex", gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            multiline
            minRows={1}
            onClick={(e) => e.stopPropagation()}
          />
          <Button variant="contained" size="small" onClick={handleReply}>
            Send
          </Button>
        </Box>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: 6, mt: 2, borderLeft: "2px solid #eee", pl: 2 }}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdd={onCommentAdd}
              setError={setError}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// CommentsSection component
const CommentsSection = ({
  post,
  userId,
  onCommentAdd,
  submitting,
  setError,
}) => {
  const [newComment, setNewComment] = useState("");
  const commentsRef = useRef(null);

  const handleSubmitComment = async () => {
    if (!userId) {
      setError({
        open: true,
        message: "Please login to comment",
      });
      return;
    }

    if (!newComment.trim()) {
      setError({
        open: true,
        message: "Comment cannot be empty",
      });
      return;
    }

    const scrollPosition = window.scrollY;

    try {
      const response = await postComment(post.id, null, newComment);
      if (response.status === 201) {
        const updatedPostResponse = await getPost(post.id);
        if (updatedPostResponse.status === 200) {
          onCommentAdd(updatedPostResponse.data.comments);
          setNewComment("");

          setTimeout(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "instant",
            });
          }, 0);
        }
      }
    } catch (error) {
      setError({
        open: true,
        message: error.response?.data?.message || "Failed to post comment",
      });
    }
  };

  const organizedComments = organizeComments(post.comments);

  return (
    <Box className="comments-section" ref={commentsRef}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={!userId}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            disabled={submitting || !userId}
          >
            Post
          </Button>
        </Box>
      </Box>

      {organizedComments.length > 0 ? (
        organizedComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={post.id}
            onCommentAdd={onCommentAdd}
            setError={setError}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No comments yet
        </Typography>
      )}
    </Box>
  );
};

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upVotes, setUpVotes] = useState(0);
  const [error, setError] = useState({ open: false, message: "" });
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleCommentAdd = (newComments) => {
    setPost({
      ...post,
      comments: newComments,
    });
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
          src={
            post.authorAvatar ||
            `https://ui-avatars.com/api/?name=${post.author}&background=4284f5&color=fff`
          }
          alt={post.author}
          sx={{
            width: 40,
            height: 40,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
          onClick={() => navigate(`/profile/${post.author}`)}
        >
          {post.author[0].toUpperCase()}
        </Avatar>
        <Box ml={2}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              cursor: "pointer",
              "&:hover": {
                color: "primary.main",
              },
            }}
            onClick={() => navigate(`/profile/${post.author}`)}
          >
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
        className="post-content content-styles"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Votes and Comments Count Section */}
      <Box className="votes-section" mt={4}>
        <Box display="flex" alignItems="center" gap={3}>
          {/* Votes */}
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

          {/* Comments Count */}
          <Box display="flex" alignItems="center">
            <ChatBubbleOutlineIcon />
            <Typography variant="body2" mx={1}>
              {post.comments.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <CommentsSection
        post={post}
        userId={userId}
        onCommentAdd={handleCommentAdd}
        submitting={submitting}
        setError={setError}
      />

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
