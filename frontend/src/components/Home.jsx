import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../api/blog";
import { getProfile, updateAvatar } from "../api/user";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const UserProfile = ({ username, avatar, likes, comments, posts }) => {
  const navigate = useNavigate();
  const email =
    localStorage.getItem("email") || sessionStorage.getItem("email");

  return (
    <Box sx={{ mb: 4 }}>
      <Box className="flex flex-col items-center">
        <Box
          sx={{
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={() => navigate(`/profile`)}
        >
          <Avatar
            src={
              avatar ||
              `https://ui-avatars.com/api/?name=${username}&background=4284f5&color=fff`
            }
            sx={{ width: 80, height: 80 }}
            className="mb-2"
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            cursor: "pointer",
            "&:hover": { color: "primary.main" },
          }}
          onClick={() => navigate(`/profile`)}
        >
          {username}
        </Typography>
        {email && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {email}
          </Typography>
        )}
        <Box className="flex justify-around w-full mt-4">
          <Box className="text-center">
            <Typography variant="h6">{likes}</Typography>
            <Typography variant="body2" color="text.secondary">
              likes
            </Typography>
          </Box>
          <Box className="text-center">
            <Typography variant="h6">{comments}</Typography>
            <Typography variant="body2" color="text.secondary">
              comments
            </Typography>
          </Box>
          <Box className="text-center">
            <Typography variant="h6">{posts}</Typography>
            <Typography variant="body2" color="text.secondary">
              posts
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          className="mt-4 bg-purple-600 w-full hover:bg-purple-700"
          onClick={() => navigate("/create-post")}
        >
          Create Post
        </Button>
      </Box>
      <Divider sx={{ mt: 4 }} />
    </Box>
  );
};

const TopicsList = ({ topics, categories }) => {
  const navigate = useNavigate();

  if (!topics?.length && !categories?.length) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      {categories?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            <BookmarkIcon sx={{ mr: 1 }} />
            Categories you follow
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {categories.map((category, index) => (
              <Chip
                key={index}
                label={category.title}
                variant="outlined"
                size="small"
                onClick={() => navigate(`/category/${category.title}`)}
                sx={{
                  borderRadius: "16px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {topics?.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            <LocalOfferIcon sx={{ mr: 1 }} />
            Topics you follow
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {topics.map((topic, index) => (
              <Chip
                key={index}
                label={`#${topic.title}`}
                variant="outlined"
                size="small"
                onClick={() => navigate(`/tag/${topic.title}`)}
                sx={{
                  borderRadius: "16px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      <Divider sx={{ mt: 4 }} />
    </Box>
  );
};

function Home() {
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    last: false,
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getAllPosts(0, 5).then((response) => {
      if (response.status === 200) {
        const data = response.data;
        setPosts(data.content);
        setPageInfo({
          number: data.number,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          last: data.last,
        });
      }
    });

    getProfile(
      localStorage.getItem("username") || sessionStorage.getItem("username")
    ).then((response) => {
      if (response.status === 200) {
        setCurrentUser(response.data);
      }
    });
  }, []);

  const loadMorePosts = () => {
    if (!pageInfo.last) {
      getAllPosts(pageInfo.number + 1, pageInfo.size).then((response) => {
        if (response.status === 200) {
          const data = response.data;
          setPosts((prevPosts) => [...prevPosts, ...data.content]);
          setPageInfo({
            number: data.number,
            size: data.size,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            last: data.last,
          });
        }
      });
    }
  };

  return (
    <Box className="py-8">
      <Box className="flex flex-col md:flex-row">
        {posts?.length > 0 ? (
          <Box
            className="w-full mx-8 md:w-2/3"
            sx={{
              borderRight: "1px solid #eee",
              pr: 3,
            }}
          >
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={post.author}
                  avatar={post.avatar}
                  categories={post.categories}
                  tags={post.tags}
                  upVotes={post.upVotes}
                  comments={post.comments}
                  createdTime={post.createdTime}
                  votes={post.votes}
                />
                {index < posts.length - 1 && (
                  <Divider sx={{ my: 4, borderColor: "#eee" }} />
                )}
              </React.Fragment>
            ))}
            {!pageInfo.last && (
              <Button
                variant="contained"
                onClick={loadMorePosts}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                fullWidth
              >
                Load More
              </Button>
            )}
          </Box>
        ) : (
          <Box className="w-full md:w-2/3">
            <Typography variant="h6">No posts found</Typography>
          </Box>
        )}

        <Box className="w-full pr-8 md:w-1/3 mt-4 md:mt-0">
          {currentUser && (
            <UserProfile
              username={currentUser.name}
              avatar={currentUser.avatar}
              likes={currentUser.totalUpVotes}
              comments={currentUser.totalComments}
              posts={currentUser.blogs?.length || 0}
            />
          )}
          {currentUser && (
            <TopicsList
              topics={currentUser.tags}
              categories={currentUser.categories}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
