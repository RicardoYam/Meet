import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Select,
  Divider,
  Chip,
  MenuItem,
} from "@mui/material";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../api/blog";
import { getProfile, unfollowUser, followUser } from "../api/user";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

const UserProfile = ({ username, avatar, likes, comments, posts, bio }) => {
  const navigate = useNavigate();
  const email =
    localStorage.getItem("email") || sessionStorage.getItem("email");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (username) {
      getProfile(username).then((response) => {
        if (response.status === 200) {
          setUserProfile(response.data);
        }
      });
    }
  }, [username]);

  return (
    <Box
      sx={{
        mb: 4,
        mt: 4,
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #ececee",
      }}
    >
      {/* Banner */}
      <Box
        sx={{
          height: "80px",
          background: userProfile?.banner
            ? `url(${userProfile.banner}) center/cover`
            : "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
          position: "relative",
          backgroundSize: "cover",
          backgroundPosition: "center",
          margin: "10px 10px 0 10px",
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* Profile Content */}
      <Box sx={{ padding: "0 20px 20px" }}>
        {/* Avatar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "-40px",
          }}
        >
          <Avatar
            src={
              avatar ||
              `https://ui-avatars.com/api/?name=${username}&background=4284f5&color=fff`
            }
            sx={{
              width: 80,
              height: 80,
              border: "4px solid white",
              cursor: "pointer",
              marginBottom: 1,
            }}
            onClick={() => navigate(`/profile`)}
          />
          <Typography
            variant="h6"
            sx={{
              color: "black",
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
              fontWeight: "bold",
            }}
            onClick={() => navigate(`/profile`)}
          >
            {username}
          </Typography>

          {bio ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {bio}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Oops, no bio written
            </Typography>
          )}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            my: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "black" }}>
              {likes}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              likes
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "black" }}>
              {comments}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              comments
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "black" }}>
              {posts}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              posts
            </Typography>
          </Box>
        </Box>

        {/* Create Post Button */}
        <Button
          variant="contained"
          className="mt-4 bg-purple-600 w-full hover:bg-purple-700"
          onClick={() => navigate("/create-post")}
        >
          Create Post
        </Button>
      </Box>
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

const TopicsCard = ({ topics }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mb: 4,
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #ececee",
        maxHeight: "200px",
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Topics you follow
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {topics?.map((topic) => (
          <Chip
            key={topic.id}
            label={`#${topic.title}`}
            onClick={() => navigate(`/tag/${topic.title}`)}
            sx={{
              borderRadius: "20px",
              backgroundColor: "white",
              border: "1px solid black",
              color: "black",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const FollowingCard = ({ following }) => {
  const navigate = useNavigate();
  const [followingUsers, setFollowingUsers] = useState(
    following?.slice(0, 3) || []
  );
  const currentUserId =
    localStorage.getItem("id") || sessionStorage.getItem("id");

  const handleFollowToggle = async (targetId) => {
    try {
      const isFollowing = followingUsers.some((user) => user.id === targetId);

      if (isFollowing) {
        await unfollowUser(currentUserId, targetId);
        setFollowingUsers(
          followingUsers.filter((user) => user.id !== targetId)
        );
      } else {
        await followUser(currentUserId, targetId);
        // Optionally fetch updated user data to get the new following list
        const response = await getProfile(
          localStorage.getItem("username") || sessionStorage.getItem("username")
        );
        if (response.status === 200) {
          setFollowingUsers(response.data.following?.slice(0, 3) || []);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <Box
      sx={{
        mb: 4,
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #ececee",
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Users you follow
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {followingUsers.map((user) => (
          <Box
            key={user.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=4284f5&color=fff`
                }
                sx={{
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={() => navigate(`/profile/${user.name}`)}
              />
              <Typography
                sx={{
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
                onClick={() => navigate(`/profile/${user.name}`)}
              >
                {user.name}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleFollowToggle(user.id)}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                minWidth: "100px",
                color: "#9333ea",
                borderColor: "#9333ea",
                "&:hover": {
                  borderColor: "#891fed",
                  backgroundColor: "#f5d7fc",
                },
              }}
            >
              Following
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const LoginPromptCard = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mb: 4,
        mt: 4,
        background: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
        borderRadius: "12px",
        overflow: "hidden",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
      onClick={() => navigate("/login")}
    >
      <Box>
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "white",
              fontWeight: 500,
              fontSize: "0.9rem",
              mb: 0.5,
            }}
          >
            Your Adventure Begins Here!✨
          </Typography>
          <ArrowOutwardIcon sx={{ color: "white" }} />
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "white",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          Share your journey, inspire others, and be part of a community of
          adventurers. Sign up to start your story!
        </Typography>
      </Box>
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
  const [sortBy, setSortBy] = useState("Newest");

  const sortOptions = {
    Newest: { sortBy: "createdTime", sortDir: "desc" },
    Oldest: { sortBy: "createdTime", sortDir: "asc" },
    "Most Liked": { sortBy: "votes", sortDir: "asc" },
  };

  useEffect(() => {
    const { sortBy: apiSortBy, sortDir } = sortOptions[sortBy];
    getAllPosts(0, 5, null, null, apiSortBy, sortDir).then((response) => {
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
  }, [sortBy]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const loadMorePosts = () => {
    if (!pageInfo.last) {
      const { sortBy: apiSortBy, sortDir } = sortOptions[sortBy];
      getAllPosts(
        pageInfo.number + 1,
        pageInfo.size,
        null,
        null,
        apiSortBy,
        sortDir
      ).then((response) => {
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
    <Box>
      <Box className="flex flex-col md:flex-row">
        {posts?.length > 0 ? (
          <Box
            className="w-full mx-8 md:w-3/4"
            sx={{
              borderRight: "1px solid #eee",
              pr: 3,
            }}
          >
            <Box className="flex justify-between items-center align-middle mt-4">
              <Typography variant="h6">Articles</Typography>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                sx={{
                  width: "120px",
                  height: "40px",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                {Object.keys(sortOptions).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Divider
              sx={{ mt: 2, mb: 4, borderColor: "#ececee", borderWidth: 1 }}
            />

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
                  <Divider
                    sx={{ my: 4, borderColor: "#ececee", borderWidth: 1 }}
                  />
                )}
              </React.Fragment>
            ))}
            {!pageInfo.last && (
              <Button
                variant="contained"
                onClick={loadMorePosts}
                className="mt-4 mb-4 bg-purple-600 hover:bg-purple-700"
                fullWidth
              >
                Load More
              </Button>
            )}
          </Box>
        ) : (
          <Box className="w-full md:w-3/4">
            <Typography variant="h6">No posts found</Typography>
          </Box>
        )}

        <Box className="w-full pr-8 md:w-1/4 mt-4 md:mt-0">
          {currentUser ? (
            <>
              <UserProfile
                username={currentUser.name}
                avatar={currentUser.avatar}
                likes={currentUser.totalUpVotes}
                comments={currentUser.totalComments}
                posts={currentUser.blogs?.length || 0}
                bio={currentUser.bio}
              />
              {currentUser.tags?.length > 0 && (
                <TopicsCard topics={currentUser.tags} />
              )}
              {currentUser.following?.length > 0 && (
                <FollowingCard following={currentUser.following} />
              )}
            </>
          ) : (
            <LoginPromptCard />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
